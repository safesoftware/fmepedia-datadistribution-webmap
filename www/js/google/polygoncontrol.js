function PolygonDrawTools(myGoogleMap){
    var me = this;

    me.drawManager = new google.maps.drawing.DrawingManager({
        drawingControl: false,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT, 
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ]
        },
        polygonOptions:{
            editable: true,
            strokeColor: '#505050'
            /*fillColor: '#D8F781',
            strokeOpacity:,
            strokeWeight:*/
        }
    });

    me.drawManager.setMap(myGoogleMap);
    me.PolyListener = google.maps.event.addListener(me.drawManager, 'polygoncomplete', function(e){
        me.myPolygon = e;
        me.drawManager.setDrawingMode(null);

        var xml = me.getPolygonCoordsXML();
        $('#geom').attr('value', xml);
        $('#geom').change();
    })


};

PolygonDrawTools.prototype.drawPolygon = function(){
    var me = this;
    if(me.myPolygon){
        me.myPolygon.setMap(null);
    }
    me.drawManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
};

PolygonDrawTools.prototype.clearPolygon = function(){
    var me = this;
    me.myPolygon.setMap(null);
    me.myPolygon = null;
    $('#geom').attr('value', "");
    $('#geom').change();
};

PolygonDrawTools.prototype.getPolygonCoords = function(){
    var me = this;
    var vertices = me.myPolygon.getPath();
    var vertList = "";
    for(var i=0; i<vertices.getLength(); i++){
        var xy = vertices.getAt(i);
        vertList += " " + xy;
    }

    alert(vertList);
};

PolygonDrawTools.prototype.polyIsComplete = function(){
    var me = this;
    if (me.myPolygon){
        return true;
    }
    else {
        return false;
    }
};

PolygonDrawTools.prototype.getPolygonCoordsXML = function(){
    var me = this;
    if (me.polyIsComplete){
        var textString = 'POLYGON(('

        var vertices = me.myPolygon.getPath();
        for(var i=0; i<vertices.getLength(); i++){
            var lat = vertices.getAt(i).lat();
            var lng = vertices.getAt(i).lng();
            textString += lng + ' ';
            textString += lat + ',';
        }

        textString = textString.substring(0,textString.length - 1);
        textString += '))';
        return textString;
   }
   else{
    return "";
   }
    
}