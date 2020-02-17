import $ from "jquery";
import * as d3 from "d3";

$.getJSON( "./src/data/langs.json", { name: "John", time: "2pm" } )
  .done(function( json ) {

    let ar = {};

	$.each(json, function( k, v ) {
		let datum = {
			'name': v["Nombre de lengua"],
			"value": v["Hablantes"],
			'name-es': v["Nombre de lengua"],
			"genus": v["Genus"],
			"family": v["Familia"],
			"ma": v["Macro-área"],
			"lat": v["Lat"],
			"lon": v["Lon"],
			"countries": extractCountries(v)
		};
		ar[v["Language name"].toLowerCase()] = datum;
	});

	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ar, null, '\t'));
	$('body').append('<a id="downloadAnchorElem">Download</a>');
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", "languages-data.json");
	//dlAnchorElem.click();

	$(dlAnchorElem).css('position', 'absolute');

  })
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});

function extractCountries(d){
	let ar = [];
	ar.push(d['Países']);

	for(let i=0; i<10; i++){
		let idx = '__' + i;

		if(d.hasOwnProperty(idx) && d[idx] > ""){
			ar.push(d[idx]);
		}
	}

	return ar;
}