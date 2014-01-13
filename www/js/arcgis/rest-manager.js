var tokenId = '80125540cbc45832470b738dfc5d2c08f46cdd58';  //added 20110815 SM. (srvrrest)

var restManager = {

	/*
	 Create the XMLHttpRequest object
	 */
	xhReq : '',

	/*
	 Commonly available on the web, this function was taken from:
	 http://ajaxpatterns.org/XMLHttpRequest_Call
	 */
	createXMLHttpRequest : function() {
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
	},
	
	
	/*
	 Display the result when complete
	 */
	onResponse : function() {
		// 4 indicates a result is ready
		if(this.readyState != 4)
			return;
		// Get the response and cretae a form item
		restManager.parseJSONResponse(this.responseText);
		return;
	},
	
	
	/**
	 * Called when the page first loads. Calls FME Server REST API and retrieves the XML.
	 */
	triggerRequest : function() {

		this.xhReq = this.createXMLHttpRequest();

		// Request Variables
		pHostName = "fmeserver.com";
		pUrlBase = "http://" + pHostName + "/fmerest/repositories/Demos/DataDownloadService/parameters/.json";
		pHttpMethod = "GET";
		pRestCall = pUrlBase + "?token=" + tokenId;

		// Send request
		this.xhReq.open(pHttpMethod, pRestCall, true);
		this.xhReq.onreadystatechange = this.onResponse;
		this.xhReq.send(null);
	},
	
	
	/**
	 *
	 */
	parseJSONResponse : function(inResult) {

		var jsonDoc = JSON.parse(inResult);
		//Get the form, we will append the combo-box to this form.
		this.fmeForm =  document.forms['fmeForm'];
		//Get all parameter objects within the JSON. The parameter objects will
		//be used to populate the combo box.
		var parameters = jsonDoc.serviceResponse.parameters.parameter;
		for( i = 0; i < parameters.length; i++) {
			// We only want to use the parameter if it is of type LOOKUP_CHOICE.
			if(parameters[i].type === "LOOKUP_CHOICE") {
				this.createComboBox(parameters);
			}
			if(parameters[i].type === "LISTBOX_ENCODED") {
				this.createCheckboxGroup(parameters);
			}
		}
	},
	
	
	/**
	 * Dynamically creates a combo box based upon the response from 
	 * the FME Server REST call.
	 */
	createComboBox : function(inParameters) {
		//Create an empty select element. We will append the option
		// elements to this element
		var _select = document.createElement('select');
		_select.name = inParameters[i].name;

		//Obtain the options object
		var options = inParameters[i].options.option;
		for( j = 0; j < options.length; j++) {
			//Create an option element
			var _option = document.createElement('option');
			//Set the text node to the display alias in the options object.
			var displayNameNode = options[j].displayAlias;
			var _text = document.createTextNode(displayNameNode);
			//Set the value attribute to the parameter value. This is the value FME
			//uses when it runs the translation.
			_option.value = options[j].value;
			_option.name = options[j].name;
			//Append the text to the option and the option to the select tag. We now have something that looks like this
			//<select>
			//    <option value="fme_vlaue">Choice with alias value</option>
			//    ...
			//</select>
			_option.appendChild(_text);
			_select.appendChild(_option);
		}

		var _div = document.createElement('div');

		//Append the select elements to the form
		_div.appendChild(document.createTextNode(inParameters[i].description + ': '));

		_div.appendChild(document.createElement("br"));
		_div.appendChild(_select);
		var br = document.createElement("br");
		_div.appendChild(br);
		this.fmeForm.insertBefore(_div, this.fmeForm.firstChild);
	},
	
	
	/**
	 * Dynamically creates a check box group based upon the response from 
	 * the FME Server REST call.
	 */
	createCheckboxGroup : function(inParameters) {

		//Append the select elements to the form
		var _div = document.createElement('div');
		_div.appendChild(document.createTextNode(inParameters[i].description));
		var br = document.createElement("br");
		_div.appendChild(br);
		//Obtain the options object
		var options = inParameters[i].options.option;
		var paramName = inParameters[i].name;

		for( j = 0; j < options.length; j++) {
			var _input = document.createElement('input');
			_input.type = 'checkbox';
			_input.value = options[j].value;
			_input.name = paramName;
			_div.appendChild(_input);
			var _text = document.createTextNode(options[j].value);
			var p = document.createElement("element");
			p.appendChild(_text);
			var br = document.createElement("br");
			p.appendChild(br);
			_div.appendChild(p);
		}
		this.fmeForm.insertBefore(_div, this.fmeForm.firstChild);
	}
}