<?php
header("access-control-allow-origin: *");

/* Configuration */


$protocol='http://'; // used for subject uri
$uri_base='/meta-pfarrerbuch.evangelische-archive.de';
$base='/data'; // used for base folder e.g. when used behind proxy e.g. /data/

$uri=$_SERVER['REQUEST_URI'];
if (strpos($uri, $base) !== 0) $uri = $base . $uri;
else $base='';

$endpoints = ['https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/brandenburg/sparql',
	       'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/kps/sparql',
	       'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/sachsen/sparql',
	     ];
$resources = [$uri_base.'/data/brandenburg/',
	      $uri_base.'/data/kps/',
	      $uri_base.'/data/sachsen/',
	     ];



/* Content negotiation */

$ctype=substr($uri,strrpos($uri,'.')+1);
if (($ctype=='html')||($ctype=='json')||($ctype=='label')) query($uri,$ctype);
else {
	$contenttype='text/html';
	foreach (getallheaders() as $name => $value) {
	    if ($name=='Accept') $contenttype=substr($value,0,strpos($value.',',','));
	}
	foreach (getallheaders() as $name => $value) {
	    if ($name=='Content-Type') $contenttype=substr($value,0,strpos($value.',',','));
	}
	if ($contenttype=='application/json') header('Location: '.$uri.'.json');
	else header('Location: '.$uri.'.html');

}

/* deliver content */
function query($uri,$type) {

	global $endpoints, $resources, $protocol, $base, $uri_base;

	/* find sparql endpint for resource */	
	$i=0;$needle='';
	do {
		$needle = substr($resources[$i],strpos($resources[$i], '/', 1));
		$contains = str_starts_with($uri, $needle);    
	    	$i++;
	} while (($i<count($resources)) and (!$contains) ) ;
	
	/* stop if no configuartion for this type of resource */
	if ($i==count($resources)) {
		echo "No configuration for LOD found.";
		exit;
	}
	$i-=1;
	
	/* define SPARQL endpoint from config */
	$endpoint = $endpoints[$i];
	
	/* construct subject resource to query */
	$subject=$protocol. substr($resources[$i],1,strpos($resources[$i], '/', 1)-1) . substr($uri,0,strrpos($uri,'.'));
	
	if (!filter_var($subject, FILTER_VALIDATE_URL)) {
		echo("$subject is not a valid URI");
		exit;
	}
	$rdfs_label='http://www.w3.org/2000/01/rdf-schema#label';
	$template = file_get_contents('template.html');
	
	$template = str_replace('[path]',$base.'/', $template);
	$template = str_replace('[subject]',$subject, $template);
	$template = str_replace('[date]', date('d.m.Y'), $template);

	/* init curl */
	if (!function_exists('curl_init')) die('CURL is not installed!');
	$ch= curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	// Get the title
	$sparql='SELECT DISTINCT ?title  WHERE { <'.$subject.'> <http://www.w3.org/2000/01/rdf-schema#label> ?title}';

	curl_setopt($ch, CURLOPT_URL, $endpoint.'?query='.urlencode($sparql).'&format=json');
	$response = curl_exec($ch);
	curl_close($ch);

	$json_result = json_decode($response);

	if ($type=='label') {
		echo $json_result->results->bindings[0]->title->value;
		exit;
	}
	
	$template = str_replace('[title]',$json_result->results->bindings[0]->title->value, $template);



	$template = str_replace('[result]',
		key_value_pairs('SELECT DISTINCT ?p ?o  WHERE { <'.$subject.'> ?p ?o}',$endpoint).
		key_value_pairs('SELECT DISTINCT ?p ?o  WHERE { ?o ?p <'.$subject.'>}',$endpoint,true),
		$template);
	
	echo $template;



}

function key_value_pairs($sparql,$endpoint,$inverse=false) {

	global $resources, $protocol, $base, $uri_base ;

	/* Get the key-value-pairs */
	
	/* init curl */
	if (!function_exists('curl_init')) die('CURL is not installed!');
	$ch= curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	
	curl_setopt($ch, CURLOPT_URL, $endpoint.'?query='.urlencode($sparql).'&format=json');
	$response = curl_exec($ch);
	
	$json_result = json_decode($response);

	curl_close($ch);




	$table = '';
	
	foreach ($json_result->results->bindings as $row) {
		if ($inverse) $table .= '<tr class="property inverse">';
		else $table .= '<tr class="property">';
		$table .= '<td><a class="resource extern" href="'.$row->p->value.'" uri="'.$row->p->value.'">'.$row->p->value.'</a></td>';
		
		if ($row->o->type=="literal") $table .= '<td>'.$row->o->value.'</td>';
		else {
			$uri=$row->o->value;
			/* check if resource controlled by the tool */
			$found = false;
			foreach ($resources as $resource) {
			    if (strpos($uri, $resource) !== false) {
				$found = true;
				break;
			    }
			}		
			$class_resource='resource';
			if ($found) {
				$position = strpos($row->o->value, $uri_base);
				/* remove full url to allow localhost-testing */
				$uri= substr($row->o->value, $position + strlen($uri_base));
				$class_resource .= ' intern';
			}
			else {
				$class_resource .= ' extern';
			}
			$table .= '<td><a class="'.$class_resource.'" href="'.$uri.'">'.$row->o->value.'</a></td>';
		}
		$table .= '</tr>';
	}
	
	return $table;

}
