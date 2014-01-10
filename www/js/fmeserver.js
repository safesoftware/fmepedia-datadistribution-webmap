/*****************************************************************************
 * FMEServer.js
 * 2013 Safe Software
 * support@safe.com
 *
 * Unofficial JavaScript API for FME Server >= 2014. This is not intended to
 * be a complete API like the C++, C# and Java APIs, but rather a collection
 * of boilerplate methods for REST API calls typically needed in a web page
 * interfacing with FME Server.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Safe Software
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 *****************************************************************************/



/**
 * Create instance of FME Server connection object
 * @this FMEServer
 * @constructor
 * @author Safe Software
 * @version 3.0
 * @param {String} svrHost Host name only, not URL
 * @param {String} token Obtained from http://yourfmeserver/fmetoken
 * @param {Number} svrPort Port, default is 80 - string
 * @param {Boolean} isSSL Connect to the server via HTTPS?
 * @return {FMEServer} FME Server connection object
 */
function FMEServer(svrHost, token, svrPort, isSSL) {

	this.svrHost = svrHost;
	this.svrPort = svrPort || "80";
	this.token = token;
	this.isSSL = isSSL || false;

}

/**
 * Gets the parameters associated with a workspace.
 * @param {String} repository The repository on the FME Server
 * @param {String} wrkspName The name of the workspace on FME Server, i.e. workspace.fmw
 * @param {Function} callback Callback function accepting sessionID as a string
 */
FMEServer.prototype.getParams = getParams;
function getParams(repository, wrkspName, callback){
	var url = "http://" + this.svrHost + ":" + this.svrPort + '/fmerest/repositories/' + repository + '/' + wrkspName + '/parameters.json?token=' + this.token;
	var params = null;

	_ajax(url, function(params) {
		callback(params.serviceResponse.parameters);
	});
}

/**
 * Gets the current session id from FME Server. You can use this to get the path to any files added through
 * the file upload service.
 * @param {String} repository The repository on the FME Server
 * @param {String} wrkspName The name of the workspace on FME Server, i.e. workspace.fmw
 * @param {Function} callback Callback function accepting sessionID as a string
 */
FMEServer.prototype.getSessionID = getSessionID;
function getSessionID(repository, wrkspName, callback){
	//returns null if there is an error
	var url = 'http://'+this.svrHost + '/fmedataupload/' + repository + '/' + wrkspName + '?opt_extractarchive=false&opt_pathlevel=3&opt_fullpath=true';
	var sessionID = null;
	
	_ajax(url, function(json) {
		callback(json.serviceResponse.session);
	});
	
}

/**
 * Returns a WebSocket connection object to the specified server
 * @param {String} stream_id A name for the desired WebSocket stream id
 * @return {WebSocket} A WebSocket connection object
 */
FMEServer.prototype.getWebSocketConnection = getWebSocketConnection;
function getWebSocketConnection(stream_id) {
	var wsConn = new WebSocket("ws://" + svrHost + ":7078/websocket");
	wsConn.onopen = function() {
		var openMsg = {
			ws_op : 'open',
			ws_stream_id : stream_id
		}
	wsConn.send(JSON.stringify(openMsg));
	};
	return wsConn;
}


FMEServer.prototype.runDataDownload = runDataDownload;
function runDataDownload(repository, wrkspName, params, callback){

	var url = 'http://' + this.svrHost + '/fmedatadownload/' + repository + '/' + wrkspName + '.fmw?' + params;

	_ajax(url, function(json){
		callback(json);
	});
            	
}



/**
 * Private AJAX helper method.
 * @param {String} url The request URL
 * @param {Function} whenDone Callback function accepting JSON response object
 */
FMEServer.prototype._ajax = _ajax;
function _ajax(url, whenDone, rtyp) {
	var req_type = rtyp || "GET";
	var http_request = new XMLHttpRequest();
	http_request.open(req_type, url);
	var my_JSON_object = null;
	http_request.onreadystatechange = function() {
		var done = 4;
		var ok = 200;
		var intError = 500;
		
		if (http_request.readyState == done && http_request.status == ok) {
			my_JSON_object = JSON.parse(http_request.responseText);
			whenDone(my_JSON_object);
		}
		else if(http_request.readyState == done && http_request.status == intError){
			my_JSON_object = JSON.parse(http_request.responseText);
			whenDone(my_JSON_object);
		}
	};
	http_request.send(null);
}



