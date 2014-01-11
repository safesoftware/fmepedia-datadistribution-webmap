// 
//  on-ready.js
//  demos
//  
//  Created by SHarper on 2012-01-12.
// 

var lon = -123.114166;
var lat = 49.264549;
var arcGisMapsManager;


function initialize() {
	
	dojo.require("esri.map");
	dojo.require("esri.toolbars.draw");

	/*Setup ArcGIS map*/
	function init() {
		arcGisMapsManager = new ArcGisMapsManager();
	}

	dojo.addOnLoad(init);
	
	
	//Create the request form dynamically using the REST API
	restManager.triggerRequest();   

}