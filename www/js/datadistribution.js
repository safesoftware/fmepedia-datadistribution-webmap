if (location.protocol != 'https:')
{
	location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}


var lon = -123.114166;  //To Customize: Change the lat and lon to reflect the center point in your map.
var lat = 49.264549;

$(document).ready(function() {

	dataDist.init({
	      server: "https://demos-safe-software.fmecloud.com", //Change this to your FME server name
	      token: "568c604bc1f235bbe137c514e7c61a8436043070"     });  //Change this to your FME Server Token
				//server: "https://demos-safe-software.fmecloud.com", //Change this to your FME server name
				//token: "65ab7c85d8888631ee75b96ecea6b64eab103d28"     });  //Change this to your FME Server Token

		});

	//To Customize: Remove everything above this line and below $(document).ready(function() {
	//and replace with this:
	//  dataDist.init({
  //      server: "http://fmeserverurl", //Change this to your FME server name
  //      token: "a1b2c3d4e5f6a1b2c3d4e5f6"     });  //Change this to your FME Server Token
	//  });
//});


var dataDist = (function () {

  // privates
  var repository = 'Demos'; //switch to Demos when done //To Customize: Change this to the repository where DataDownloadService.fmw was uploaded
  var workspaceName = 'DataDownloadService.fmw';  //To Customize: Change this if you changed the file name
	//var repository = 'AlexTest'; //switch to Demos when done //To Customize: Change this to the repository where DataDownloadService.fmw was uploaded
	//var workspaceName = 'DataDownloadService.fmw';  //To Customize: Change this if you changed the file name
	var host;
  var token;

  /**
   * Run when the page loads. Callback from the FMEServer API. JSON returned from
   * the REST API parsed and a HTML published parameter form dynamically created.
   * @param  {JSON} json Returned from the Rest API callback
   */
  function buildParams(json){

    var parameters = $('<div id="parameters" />');
    parameters.insertBefore('#submit');

    // Generates standard form elelemts from
    // the getWorkspaceParameters() return json object
    FMEServer.generateFormItems('parameters', json);

    // Add styling classes to all the select boxes
    var selects = parameters.children('select');
    for(var i = 0; i < selects.length; i++) {
        selects[i].setAttribute('class', 'input-customSize');
    }

    // Remove the auto generated GEOM element and label
    $("#parameters .AREA_OF_INTEREST_POLYGON").remove();

  }

  /**
   * Builds up the URL and query parameters.
   * @param  {Form} formInfo Published parameter form Object.
   * @return {String} The full URL.
   */
  function buildURL(formInfo){
    var str = '';
    str = host + '/fmedatadownload/' + repository + '/' + workspaceName + '?';
    var elem = formInfo[0];
    for(var i = 0; i < elem.length; i++) {
      if(elem[i].type !== 'submit') {

        if(elem[i].type === "checkbox" && elem[i].checked) {
          str += elem[i].name + "=" + elem[i].value + "&";
        } else if(elem[i].type !== "checkbox") {
          str += elem[i].name + "=" + elem[i].value + "&";
        }
      }
    }
    str = str.substring(0, str.length - 1);
    return str;
  }

  /**
   * Run on Submit click. Callback for the FMESERVER API.
   * from the translation which is displayed in a panel.
   * @param  {JSON} result JSON returned by the data download service call.
   */
   function displayResult(result){
     var resultText = result.serviceResponse.statusInfo.status;
     var featuresWritten = result.serviceResponse.fmeTransformationResult.fmeEngineResponse.numFeaturesOutput;
     var resultUrl = '';

     if(resultText == 'success'){
       if (featuresWritten != 0){
         resultUrl = result.serviceResponse.url;
				 $('#successMessage').html('<p>Your request has been successfully processed. <br/ > Click this link to download your data: <a href="' + resultUrl + '"> Download Data </a>');
				 $('#successModal').modal({show:true});
       }
       else {
				 $('#errorMessage').text('No output dataset was produced by FME, because no features were found in the selected area.');
				 $('#errorModal').modal({
					show: true
				});
			 }
     }
     else{
			 $('#errorMessage').html('<p> The following error occurred while processing your request: <br/><br/>' + result.serviceResponse.statusInfo.message + '</p>');
			 $('#errorModal').modal({
				show: true
			});
		 }
   }

  /**
   * ----------PUBLIC METHODS----------
   */
  return {

    init : function(params) {
      var self = this;
      host = params.server;
      token = params.token;
      hostVisible = params.hostVisible;

      //initialize map and drawing tools
      //will eventually be different for each web map type
      var query = document.location.search;
      var mapService = query.split('=');
      if (mapService[1] == 'google'){
        mapManager = new GoogleMapsManager();
        polygonControl = new GoogleMapsPolygonDrawTools(mapManager.myGoogleMap);
      } else {

				//loading ArcGIS modules
					require([
						"esri/Map",
						"esri/views/MapView",
						"esri/views/draw/Draw",
						"esri/Graphic",
						"esri/geometry/geometryEngine",
						"esri/widgets/Zoom",
						"esri/geometry/projection",
						"esri/geometry/SpatialReference",
						"esri/geometry/Polygon"
					], function(Map, MapView, Draw, Graphic, geometryEngine, Zoom, projection, SpatialReference, Polygon) {

						//creating map
						const map = new Map({
							basemap: "streets"
						});

						//creating map view
						const view = new MapView({
							container: "map_canvas",
							map: map,
							zoom: 12,
							center: [lon, lat],
						});

						//enabling drawing on map
						const draw = new Draw({
							view: view
						});

						//creating zoom button
						var zoom = new Zoom({
							view: view
						});

						//initializing drawing the polygon with the draw button
						document.getElementById("draw-button").onclick = function() {
							//clearing ay graphics and starting a new drawing
							view.graphics.removeAll();

							//starts creating a polygon graphic on first click
							const action = draw.create("polygon", {mode: "click"});

							// PolygonDrawAction.vertex-add
							// Fires when user clicks, or presses the "F" key.
							// Can also be triggered when the "R" key is pressed to redo.
							action.on("vertex-add", function (evt) {
								createPolygonGraphic(evt.vertices);
							});

							// PolygonDrawAction.vertex-remove
							// Fires when the "Z" key is pressed to undo the last added vertex
							action.on("vertex-remove", function (evt) {
								createPolygonGraphic(evt.vertices);
							});

							// Fires when the pointer moves over the view
							action.on("cursor-update", function (evt) {
								createPolygonGraphic(evt.vertices);
							});

							// Add a graphic representing the completed polygon
							// when user double-clicks on the view or presses the "C" key
							action.on("draw-complete", function (evt) {
								createPolygonGraphic(evt.vertices);

								//once the polygon is complete get the coordinates for vetices
								//and construct WKT polygon
								var polygon = createPolygonGraphic(evt.vertices);
								document.getElementById('geom').value = getPolygonCoordsText(polygon);
							});
						}

						// function to create polygon graphic from all the vertices drawn by user
						function createPolygonGraphic(vertices){

							//making sure there are no lingering graphics
							view.graphics.removeAll();

							//initializing new polygon
							var polygon = new Polygon ({
								type: "polygon", // autocasts as Polygon
								rings: vertices,
								spatialReference: view.spatialReference
							});

							//creating graphic from polygon
							var graphic = new Graphic({
								geometry: polygon,
								symbol: {
									type: "simple-fill", // autocasts as SimpleFillSymbol
									color: [51, 51, 51, 0.25],
									style: "solid",
									outline: {  // autocasts as SimpleLineSymbol
										color: "#545454",
										width: 2
									}
								}
							});

							//adding graphic to view
							view.graphics.add(graphic);

							//returning polygon so the coordinates of vertices can be accessed
							return polygon;
						}

						//function to create the WKT polygon
						function getPolygonCoordsText(coords) {

							textString = 'POLYGON((';

							// loop to print coords
							for(var i = 0; i < (coords.rings[0].length); i++) {
								var lat = coords.getPoint(0,i).latitude;
								var longi = coords.getPoint(0,i).longitude;
								textString += longi + ' ';
								textString += lat + ',';
							}

							textString = textString.substring(0,textString.length - 1);
							textString += '))';

							return textString;
						}

						//function for to clear graphics with clear button
						document.getElementById("clear-button").onclick = function(vertices) {
							view.graphics.removeAll();
							document.getElementById('geom').value = "";
						}

						//adding zoom button to top right
						view.ui.add(zoom, "bottom-right");
					});
				}

      FMEServer.init({
        server : host,
        token : token
      });

      //set up parameters on page
      FMEServer.getWorkspaceParameters(repository, workspaceName, buildParams);


    },

    /**
     * Called by the form when the user clicks on submit.
     * @param  {Form} formInfo Published parameter form Object.
     * @return {Boolean} Returning false prevents a new page loading.
     */
    orderData : function(formInfo){
      var params = '';
      var elem = formInfo.elements;
      for(var i = 0; i < elem.length; i++) {
        if(elem[i].type !== 'submit') {
          if(elem[i].type === "checkbox" && elem[i].checked) {
            params += elem[i].name + "=" + elem[i].value + "&";
          } else if(elem[i].type !== "checkbox") {
            params += elem[i].name + "=" + elem[i].value + "&";
          }
        }
      }
      params = params.substr(0, params.length-1);
			console.log(params);
      FMEServer.runDataDownload(repository, workspaceName, params, displayResult);
      return false;
    }

  };
}());
