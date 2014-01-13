var formRequestManager = {

	/**
	 * Called when the user clicks the Order Data button. It validates the request and then sends
	 * an AJAX request to FME Server
	 * @param {Object} inForm
	 */
	orderData : function(inForm) {

		var paramArray = [];
		var fmeServerParams = {};

		var str = '';
		var elem = inForm.elements;
		for(var i = 0; i < elem.length; i++) {
			if(elem[i].type !== 'submit') {

				if(elem[i].type === "checkbox" && elem[i].checked) {
					str += elem[i].name + "=" + elem[i].value + "&";
				} else if(elem[i].type !== "checkbox") {
					str += elem[i].name + "=" + elem[i].value + "&";
				}
			}
		}

		/*
		 Commonly available on the web, this function was taken from:
		 http://ajaxpatterns.org/XMLHttpRequest_Call
		 */
		function createXMLHttpRequest() {
			try {
				return new XMLHttpRequest();
			} catch (e) {
			}
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
			}
			alert("XMLHttpRequest not supported");
			return null;
		}

		/*
		 Display the result when complete
		 */
		function onResponse() {
			// 4 indicates a result is ready
			if(xhReq.readyState != 4)
				return;
			// Get the response and display it
			formRequestManager.parseFMEServerResult(xhReq.responseText);
			return;
		}

		/*
		 Create the XMLHttpRequest object
		 */
		var xhReq = createXMLHttpRequest();
		// Request Variables
		pHostName = "fmeserver.com";
		pUrlBase = "http://" + pHostName + "/fmedatadownload/Demos/DataDownloadService.fmw?";
		pHttpMethod = "GET";
		// Create REST call
		pRestCall = pUrlBase + str;
		// Send request
		xhReq.open(pHttpMethod, pRestCall, true);
		xhReq.onreadystatechange = onResponse;
		xhReq.send(null);
		return false;
	},
	
	
	/**
	 * Parses the result from the ajax request sent in the onOrderData function
	 * @param {Object} resp
	 */
	parseFMEServerResult : function(resp) {
		//Decode JSON response
		var jsonResp = JSON.parse(resp).serviceResponse;

		var _resultsDiv = document.getElementById('results');
		_resultsDiv.innerHTML = "";

		if(jsonResp.statusInfo.status === "success") {

			_resultsDiv.className = 'success';

			var _h2 = document.createElement('h2');
			_h2.appendChild(document.createTextNode("Translation Succeeded"));
			_resultsDiv.appendChild(_h2);

			var _a = document.createElement('a');
			_a.href = jsonResp.url;
			_a.innerHTML = "Download Data";

			_resultsDiv.appendChild(_a);

		} else {
			_resultsDiv.className = 'error';

			var _h2 = document.createElement('h2');
			_h2.appendChild(document.createTextNode("Translation Failed"));
			_resultsDiv.appendChild(_h2);

			var _p = document.createElement('p');
			_p.innerHTML = jsonResp.statusInfo.message;
			_resultsDiv.appendChild(_p);

		}

	},
	
	/**
	 * This updates the query panel with a new URL when the user updates a parameter
	 */
	updateRequestUrl : function(inForm) {
		var elem = inForm.elements;
		var str;
		for(var i = 0; i < elem.length; i++) {
			if(elem[i].type !== 'submit') {

				if(elem[i].type === "checkbox" && elem[i].checked) {
					str += elem[i].name + "=" + elem[i].value + "&";
				} else if(elem[i].type !== "checkbox") {
					str += elem[i].name + "=" + elem[i].value + "&";
				}
			}
		}

		var pUrlBase = "http://" + pHostName + "/fmedatadownload/Demos/DataDownloadService.fmw?" + str;
		var _queryPanelDiv = document.getElementById('query-panel-results');
		_queryPanelDiv.innerHTML = "";
		_queryPanelDiv.appendChild(document.createTextNode(pUrlBase));
	}
};
