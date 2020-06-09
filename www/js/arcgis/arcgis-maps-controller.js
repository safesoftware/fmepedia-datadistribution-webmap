//
//  arcgis-maps-controller.js
//  demos
//

function ArcGisMapsManager () {

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
      "esri/geometry/Polygon",
      "esri/layers/GeoJSONLayer",
      "esri/geometry/Extent"
    ], function(Map, MapView, Draw, Graphic, geometryEngine, Zoom, projection, SpatialReference, Polygon, GeoJSONLayer, Extent) {

      //creating map
      this.map = new Map({
        basemap: "streets-navigation-vector"
      });

      //creating map view
      this.view = new MapView({
        container: "map_canvas",
        map: map,
        zoom: 12,
        center: [lon, lat],
        constraints: {
          minZoom: 11
        }
      });

      //function to limit the view to Vancouver, pulled from https://community.esri.com/thread/253923-how-to-keep-the-view-over-a-specific-area-eg-over-a-country
      view.when(function() {
        limitMapView(view);
      });

      function limitMapView(view) {
        let initialExtent = view.extent;
        let initialZoom = view.zoom;
        view.watch('stationary', function(event) {
          if (!event) {
            return;
          }
          // If the center of the map has moved outside the initial extent,
          // then move back to the initial map position (i.e. initial zoom and extent
          let currentCenter = view.extent.center;
          if (!initialExtent.contains(currentCenter)) {
            view.goTo({
              target: initialExtent,
              zoom: initialZoom
            });
          }
        });
      }

      var vanRenderer = {
        type: "simple",  // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-fill",  // autocasts as new SimpleMarkerSymbol()
          size: 10,
          color: "grey"
        }
      };

      var van = new GeoJSONLayer({
        url: 'local-area-boundary-buffer.json',
        renderer: vanRenderer,
        opacity: 0.5
      });

      map.add(van);

      //enabling drawing on map
      this.draw = new Draw({
        view: view
      });

      //creating zoom button
      this.zoom = new Zoom({
        view: view
      });


      // function to create polygon graphic from all the vertices drawn by user
      ArcGisMapsManager.prototype.createPolygonGraphic = function(vertices){

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
      ArcGisMapsManager.prototype.getPolygonCoordsText = function(coords) {

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

      //adding zoom button to top right
      view.ui.add(zoom, "bottom-right");
    });

}
