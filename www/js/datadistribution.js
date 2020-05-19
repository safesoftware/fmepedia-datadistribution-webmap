if (location.protocol != 'https:')
{
	location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}


var lon = -123.114166;  //To Customize: Change the lat and lon to reflect the center point in your map.
var lat = 49.264549;

$(document).ready(function() {

	dataDist.init({
	      //server: "https://demos-safe-software.fmecloud.com", //Change this to your FME server name
	      //token: "568c604bc1f235bbe137c514e7c61a8436043070"     });  //Change this to your FME Server Token
				server: "https://demos-safe-software.fmecloud.com", //Change this to your FME server name
				token: "65ab7c85d8888631ee75b96ecea6b64eab103d28"     });  //Change this to your FME Server Token

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
  //var repository = 'Demos'; //switch to Demos when done //To Customize: Change this to the repository where DataDownloadService.fmw was uploaded
  //var workspaceName = 'DataDownloadService.fmw';  //To Customize: Change this if you changed the file name
	var repository = 'AlexTest'; //switch to Demos when done //To Customize: Change this to the repository where DataDownloadService.fmw was uploaded
	var workspaceName = 'DataDownloadService.fmw';  //To Customize: Change this if you changed the file name
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

				require([
        "esri/Map",
        "esri/views/MapView",
        "esri/views/draw/Draw",
        "esri/Graphic",
        "esri/geometry/geometryEngine",
				"esri/widgets/Zoom",
				"esri/geometry/projection",
				"esri/geometry/SpatialReference"
      ], function(Map, MapView, Draw, Graphic, geometryEngine, Zoom, projection, SpatialReference) {
        const map = new Map({
          basemap: "streets"
        });

        const view = new MapView({
          container: "map_canvas",
          map: map,
          zoom: 12,
          center: [lon, lat],
					// spatialReference: {
					// 	wkid:4326
					// }
        });

        const draw = new Draw({
          view: view
        });

				var zoom = new Zoom({
  				view: view
				});

				var outSpatialReference = new SpatialReference ({
					wkid: 4326
				});

				projection.load();

				document.getElementById("draw-button").onclick = function() {
          view.graphics.removeAll();

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
						var polygon = createPolygonGraphic(evt.vertices);
						//var polygon2 = projection.project(polygon, outSpatialReference);
						console.log(polygon);
						console.log(projection.getTransformation(polygon.spatialReference, outSpatialReference));
						document.getElementById('geom').value = getPolygonCoordsText(polygon.rings);
					});
				}

				function createPolygonGraphic(vertices){
  				view.graphics.removeAll();
  				var polygon = {
    				type: "polygon", // autocasts as Polygon
    				rings: vertices,
    				spatialReference: view.spatialReference
						// spatialReference: {
						// 	wkid:4326
						// }
  				};

  				var graphic = new Graphic({
    				geometry: polygon,
    				symbol: {
      				type: "simple-fill", // autocasts as SimpleFillSymbol
      				color: "purple",
      				style: "solid",
      				outline: {  // autocasts as SimpleLineSymbol
        				color: "white",
        				width: 1
      				}
    				}
  				});

  				view.graphics.add(graphic);
					return polygon;
				}


				function getPolygonCoordsText(coords) {
					//console.log(outSpatialReference);
					//coords = projection.project(coords, outSpatialReference);
					textString = 'POLYGON((';

					// loop to print coords
					for(var i = 0; i < (coords.length); i++) {
						//coords[i] = projection.project(coords[i], outSpatialReference);
						var lat = coords[i][1];
						var longi = coords[i][0];
						textString += longi + ' ';
						textString += lat + ',';
					}

					textString = textString.substring(0,textString.length - 1);
					textString += '))';

					return textString;
				}

			document.getElementById("clear-button").onclick = function(vertices) {
				view.graphics.removeAll();
				document.getElementById('geom').value = "";
			}
				// require([
	      //   "esri/widgets/Sketch",
	      //   "esri/Map",
	      //   "esri/layers/GraphicsLayer",
				// 	"esri/Graphic",
	      //   "esri/views/MapView",
				// 	"esri/views/draw/Draw",
				// 	"esri/geometry/geometryEngine"
	      // ], function(Sketch, Map, GraphicsLayer, MapView, Draw, geometryEngine, Graphic) {
	      //   const layer = new GraphicsLayer();
				//
	      //   const map = new Map({
	      //     basemap: "streets",
	      //     layers: [layer]
	      //   });
				//
	      //   const view = new MapView({
	      //     container: "map_canvas",
	      //     map: map,
	      //     zoom: 12,
	      //     center: [lon, lat]
	      //   });

	        // const sketch = new Sketch({
	        //   layer: layer,
	        //   view: view,
					// 	availableCreateTools: ["polygon", "rectangle", "circle"],
	        //   // graphic will be selected as soon as it is created
	        //   creationMode: "update"
	        // });

	        //view.ui.add(sketch, "top-right");
					//view.ui.move("zoom", "bottom-right");
					view.ui.add(zoom, "top-right");
	      });

        //copied from the arcgis on-ready.js
        // dojo.require("esri.map");
        // dojo.require("esri.toolbars.draw");
        // dojo.require("esri.SpatialReference");

        // function initialize(){
        //   mapManager = new ArcGisMapsManager();
        //   polygonControl = new ArcGISPolygonDrawTools(mapManager);
        // }
        // dojo.addOnLoad(initialize);
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
