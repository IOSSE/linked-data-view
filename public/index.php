<?php
header("access-control-allow-origin: *");

/* Configuration */

$endpoints = ['https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/brandenburg/sparql',
	       'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/kps/sparql',
	       'https://meta-pfarrerbuch.evangelische-archive.de/meta-daten/sachsen/sparql',
	     ];
$resources = ['/meta-pfarrerbuch.evangelische-archive.de/data/brandenburg/',
	      '/meta-pfarrerbuch.evangelische-archive.de/data/kps/',
	      '/meta-pfarrerbuch.evangelische-archive.de/data/sachsen/',
	     ];

$protocol='http://'; // used for subject uri

$base='/data'; // used for base folder e.g. when used behind proxy e.g. /data/

$uri=$_SERVER['REQUEST_URI'];
if (strpos($uri, $base) !== 0) $uri = $base . $uri;

echo $uri;
exit;
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

	global $endpoints, $resources, $protocol;

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
	
	$script_path = substr($_SERVER['SCRIPT_NAME'],0,strrpos($_SERVER['SCRIPT_NAME'],'index.php'));
	$template = str_replace('index.css',$script_path.'index.css', $template);
	$template = str_replace('index.js',$script_path.'index.js', $template);
	$template = str_replace('[subject]',$subject, $template);

	/* init curl */
	if (!function_exists('curl_init')) die('CURL is not installed!');
	$ch= curl_init();
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	// Get the title
	$sparql='SELECT DISTINCT ?title  WHERE { <'.$subject.'> <http://www.w3.org/2000/01/rdf-schema#label> ?title}';

	curl_setopt($ch, CURLOPT_URL, $endpoint.'?query='.urlencode($sparql).'&format=json');
	$response = curl_exec($ch);

	$json_result = json_decode($response);

	if ($type=='label') {
		echo $json_result->results->bindings[0]->title->value;
		exit;
	}
	
	$template = str_replace('[title]',$json_result->results->bindings[0]->title->value, $template);


	// Get the key-value-pairs
	$sparql='SELECT DISTINCT ?p ?o  WHERE { <'.$subject.'> ?p ?o}';
	curl_setopt($ch, CURLOPT_URL, $endpoint.'?query='.urlencode($sparql).'&format=json');
	$response = curl_exec($ch);
	
	$json_result = json_decode($response);

	$template = str_replace('[subject]',$subject, $template);
	
	curl_close($ch);




	$table = '';
	
	foreach ($json_result->results->bindings as $row) {
		$table .= '<tr>';
		$table .= '<td><a href="'.$row->p->value.'" uri="'.$row->p->value.'">'.$row->p->value.'</a></td>';
		
		if ($row->o->type=="literal") $table .= '<td>'.$row->o->value.'</td>';
		else $table .= '<td><a href="'.$row->o->value.'">'.$row->o->value.'</a></td>';

		$table .= '</tr>';
	}

	$template = str_replace('[result]',$table, $template);
	
	echo $template;



}

