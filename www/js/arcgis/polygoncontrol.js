function PolygonDrawTools(myArcGISMap){

	//somthing goes here
	this.arcgisMap = myArcGISMap;
}

/**
 * Fired when the user clicks the draw polygon button
 */
PolygonDrawTools.prototype.drawPolygon = function() {
	this.clearPolygon();
	this.arcgisMap.toolbar.activate(esri.toolbars.Draw.POLYGON);
}
/**
 * Called when the user clicks the Clear button
 */
PolygonDrawTools.prototype.clearPolygon = function() {

	this.arcgisMap.toolbar.deactivate(esri.toolbars.Draw.POLYGON);
	this.arcgisMap.arcgisMap.graphics.clear();
	document.getElementById('geom').value = "";
	//formRequestManager.updateRequestUrl(document.forms["fmeForm"]);
}
/**
 * Add a geometry to map, handles different geometry types
 * @param {Object} geometry
 */
PolygonDrawTools.prototype.addToMap = function(geometry) {
	switch (geometry.type) {
		case "point":
			var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
			break;
		case "polyline":
			var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
			break;
		case "polygon":
			var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
			break;
		case "extent":
			var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
			break;
		case "multipoint":
			var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 1), new dojo.Color([255, 255, 0, 0.5]));
			break;
	}

	var graphic = new esri.Graphic(geometry, symbol);
	this.arcgisMap.graphics.clear();
	this.arcgisMap.graphics.add(graphic);
	this.toolbar.deactivate(esri.toolbars.Draw.POLYGON);
	this.getPolygonCoordsText(geometry.rings[0]);
		$('#geom').attr('value', geom);
	$('#geom').change();
}
/**
 * Builds up the XML which will be passed into the post request and used by FME Server to generate the
 * bounding box.
 */
PolygonDrawTools.prototype.getPolygonCoordsText = function(coords) {

	var header = "<lt>?xml<space>version=<quote>1.0<quote><space>encoding=<quote>US_ASCII<quote><space>standalone=<quote>no<quote><space>?<gt><lt>geometry<gt><lt>polygon<gt><lt>line<gt>";

	var footer = "<lt><solidus>line<gt><lt><solidus>polygon<gt><lt><solidus>geometry<gt>";

	// print coords header
	//document.getElementById("coords").value =  header;
	XMLString = header;

	// loop to print coords
	for(var i = 0; i < (coords.length); i++) {
		var lat = coords[i][1];
		var longi = coords[i][0];
		XMLString += "<lt>coord<space>x=<quote>" + longi + "<quote><space>y=<quote>" + lat + "<quote><solidus><gt>";

	}
	XMLString += footer;
	//Write XML to GEOM object.

	document.getElementById('geom').value = XMLString;

	formRequestManager.updateRequestUrl(document.forms["fmeForm"]);
	return XMLString;

}