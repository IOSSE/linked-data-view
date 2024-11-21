const currentUri = window.location.href;

console.log(currentUri);


let elements = document.querySelectorAll ('a[href*="//data.pcp-on-web.de/"]');

elements.forEach(function(link, index) {

	const Http = new XMLHttpRequest();
	
	url=link.getAttribute("href");
	url=url.replace('http://','https://wb.pcp-on-web.de/resource/');

	Http.open("GET", url+'.label', false);
	Http.send();

	if (Http.responseText!='') link.innerHTML = Http.responseText;

});
