			
jsPlumb.ready(function() {

  jsPlumb.Defaults.Container=$("#workzone");
  jsPlumb.Defaults.PaintStyle = { strokeStyle:"#F09E30", lineWidth:2, dashstyle: '3 3', };
  jsPlumb.Defaults.EndpointStyle = { radius:7, fillStyle:"#F09E30" };
  jsPlumb.importDefaults({Connector : [ "Bezier", { curviness:50 } ]});
      
   
  jsPlumb.bind("connection", function(info) {
    var target = $('#' + info.targetId);
	var source = $('#' + info.sourceId);
	if((target.hasClass("project") && source.hasClass("project")) 
		|| (target.hasClass("tableNumber") && source.hasClass("tableNumber"))){
		jsPlumb.detach(info.connection);
	}
});

});

var deleteEndPointsByElement = function(el){
	var endpoints = jsPlumb.getEndpoints(el);
			endpoints.forEach(function(item, i, arr){jsPlumb.deleteEndpoint(item);})
			el.remove();
};


var anEndpointSource = {
        endpoint: "Dot",
        isSource: true,
        isTarget: false,
        maxConnections: 1,
        anchor: [1,0.5,0,0]
    };

var anEndpointDestination = {
        endpoint: "Dot",
        isSource: false,
        isTarget: true,
        maxConnections: 1,
        anchor: [0,0.5,0,0]
    };
			
var addDraggableElementEndPoint = function(el){
jsPlumb.draggable(el, {
      containment: 'parent'
    });
	
	jsPlumb.addEndpoint(
                    el,
                    anEndpointSource
                );
                
                jsPlumb.addEndpoint(
                    el,
                    anEndpointDestination
                );
};

