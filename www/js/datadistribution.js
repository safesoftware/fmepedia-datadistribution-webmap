var lon = -123.114166;
var lat = 49.264549;

$(document).ready(function() {
	dataDist.init({
    host : "fmepedia2014-safe-software.fmecloud.com",
    token : "fb1c3ee6828e6814c75512dd4770a02e73d913b8"
  });
});


var dataDist = (function () {

  // privates
  var repository = 'Demos';
  var workspaceName = 'DataDownloadService';
  var host;
  var token;

  /**
   * Run when the page laods. Callback from the FMEServer API. JSON returned from 
   * the REST API parsed and a HTML published parameter form dynamically created.
   * @param  {JSON} json Returned from the Rest API callback
   */
  function buildParams(json){

    var paramArray = json.parameter;
    var parameters = $('<div id="parameters" />');

    for (var i = 0; i < paramArray.length; i++){

      //populate drop-down options for choice-type parameters
      if (paramArray[i].type == 'LOOKUP_CHOICE'){
        //populate drop-down options on page
        var section = $('<div />');
        var title = paramArray[i].description + ':';
        var select = $('<select class="input-customSize" name=' + paramArray[i].name +'/>');
        var optionArray = paramArray[i].options.option;
        for (var x = 0; x < optionArray.length; x++){
          var option = $('<option />', {value: optionArray[x].value, text: optionArray[x].displayAlias});
          //$('#' + paramArray[i].name).append(option);
          select.append(option);
        }
        section.append(title);
        section.append(select);
        parameters.append(section);
      }

      //Creates the checkbox list.
      if(paramArray[i].type == 'LISTBOX_ENCODED'){
        var section = $('<div />');
        var title = paramArray[i].description + ':';
        var checkBoxes = $('<div id="' + paramArray[i].name + '" />');
        var optionArray = paramArray[i].options.option;
        for (var x = 0; x < optionArray.length; x++){
          var box = $('<input type="checkbox" value="'+ optionArray[x].value + '" name="' + paramArray[i].name +'"><element>' + optionArray[x].value + '</element></>');
          checkBoxes.append(box);
          checkBoxes.append($('<br/>'));
        }
        section.append(title);
        section.append(checkBoxes);
        parameters.append(section);
      }
    }
    parameters.insertBefore('#submit');

  }

  /**
   * Builds up the URL and query parameters.
   * @param  {Form} formInfo Published parameter form Object.
   * @return {String} The full URL.
   */
  function buildURL(formInfo){
    var str = '';
    str = 'http://' + host + '/fmedatadownload/' + repository + '/' + workspaceName + '.fmw?';
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
    var resultText = result.serviceResponse.fmeTransformationResult.fmeEngineResponse.statusMessage;
    var resultUrl = '';
    var resultDiv = $('<div />');

    if(result.serviceResponse.statusInfo.status == 'success'){
      resultUrl = result.serviceResponse.url;
      resultDiv.append($('<h2>' + resultText + '</h2>'));
      resultDiv.append($('<a href="' + resultUrl + '">' + 'Download Data </a>'));
    }
    else{
      resultDiv.append($('<h2>There was an error processing your request</h2>'));
      resultDiv.append($('<h2>' + resultText + '</h2>'));
    }

    $('#results').html(resultDiv);
  }


  /**
   * ----------PUBLIC METHODS----------
   */
  return {

    init : function(params) {
      var self = this;
      host = params.host;
      token = params.token;
      hostVisible = params.hostVisible;

      //initialize map and drawing tools
      //will eventually be different for each web map type
      var query = document.location.search;
      var mapService = query.split('=');
      if (mapService[1] == 'google'){
        mapManager = new GoogleMapsManager();
        polygonControl = new PolygonDrawTools(mapManager.myGoogleMap);
      } 
      if (mapService[1] == 'arcgis'){
        //copied from th arcgis on-ready.js
        dojo.require("esri.map");
        dojo.require("esri.toolbars.draw");

        function initialize(){
          mapManager = new ArcGisMapsManager();
          polygonControl = new PolygonDrawTools(mapManager);
        }

        dojo.addOnLoad(initialize);

        //polygonControl = new PolygonDrawTools(dojo.mapManager);
      }
      myFMEServer = new FMEServer(host, token);

      //set up parameters on page
      myFMEServer.getParams(repository, workspaceName, buildParams);

      $('#geom').change(function(){
        dataDist.updateQuery();
      });
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

      myFMEServer.runDataDownload(repository, workspaceName, params, displayResult);
      
      return false;
    },

    /**
     * Updates the URL text, called when a form item changes.
     */
    updateQuery : function(){
      var queryStr = buildURL($('#fmeForm'));
      $('#query-panel-results').text(queryStr);
    }
  };
}());