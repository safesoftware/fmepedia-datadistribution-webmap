function GoogleMapsManager() {
	//Initialise Google Maps
	//
	var me = this;
	var mapOptions = {
		center: new google.maps.LatLng(lat, lon),
		zoom: 13,
		minZoom: 12,
		disableDefaultUI: true,
		zoomControl: true,
		panControl: true,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_RIGHT,
			drawingModes: [
				google.maps.drawing.OverlayType.POLYGON
			]
		},
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_BOTTOM,
			style: google.maps.ZoomControlStyle.SMALL
		},
		panControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER
		},
		restriction: {
			latLngBounds: {
				north: 49.365,
				south: 49.15,
				west: -123.365,
				east: -122.9
			}
		}
	}

	me.myGoogleMap = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

	me.myGoogleMap.data.loadGeoJson('local-area-boundary-buffer.json');
	me.myGoogleMap.data.setStyle({
		strokeWeight: 1
	});

};
