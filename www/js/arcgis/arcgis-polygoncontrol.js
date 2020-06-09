var myMap;

function ArcGISPolygonDrawTools(myArcGISMap){
	myMap = myArcGISMap;
}

/**
 * Fired when the user clicks the draw polygon button
 */
ArcGISPolygonDrawTools.prototype.drawPolygon = function() {
	//clearing ay graphics and starting a new drawing
	view.graphics.removeAll();

	//starts creating a polygon graphic on first click
	var action = draw.create("polygon", {mode: "click"});

	// PolygonDrawAction.vertex-add
	// Fires when user clicks, or presses the "F" key.
	// Can also be triggered when the "R" key is pressed to redo.
	action.on("vertex-add", function (evt) {
		myMap.createPolygonGraphic(evt.vertices);
	});

	// PolygonDrawAction.vertex-remove
	// Fires when the "Z" key is pressed to undo the last added vertex
	action.on("vertex-remove", function (evt) {
		myMap.createPolygonGraphic(evt.vertices);
	});

	// Fires when the pointer moves over the view
	action.on("cursor-update", function (evt) {
		myMap.createPolygonGraphic(evt.vertices);
	});

	// Add a graphic representing the completed polygon
	// when user double-clicks on the view or presses the "C" key
	action.on("draw-complete", function (evt) {
		myMap.createPolygonGraphic(evt.vertices);

		//once the polygon is complete get the coordinates for vetices
		//and construct WKT polygon
		var polygon = myMap.createPolygonGraphic(evt.vertices);
		document.getElementById('geom').value = myMap.getPolygonCoordsText(polygon);
	});
}
/**
 * Called when the user clicks the Clear button
 */
ArcGISPolygonDrawTools.prototype.clearPolygon = function() {

	view.graphics.removeAll();
	document.getElementById('geom').value = "";

}
