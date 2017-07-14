var calcPath = [];

function СalcPathEl(source, target, type){
	this.source = source;
	this.target = target;
	this.type = type;
}
		
jsPlumb.ready(function() {

  jsPlumb.Defaults.Container=$("#workzone");
  jsPlumb.Defaults.PaintStyle = { strokeStyle:"#F09E30", lineWidth:2, dashstyle: '3 3', };
  jsPlumb.Defaults.EndpointStyle = { radius:7, fillStyle:"#F09E30" };
  jsPlumb.importDefaults({Connector : [ "Bezier", { curviness:50 } ]});
      
   
  jsPlumb.bind("connection", function(info) {
	  
	var err = false;
    var arr = [];
	createPath(arr, info.targetId, err);
	if(arr.includes(info.sourceId)){
		jsPlumb.detach(info.connection);
		return;
	}
	
	var indexRem = calcPath.findIndex(el=> el.source === info.sourceId);
	
	if(indexRem > -1){
		calcPath[indexRem].target = info.targetId;
	}
	
	var target = $('#' + info.targetId);
	var source = $('#' + info.sourceId);
	var tempOps = target.hasClass("tempOps") && source.hasClass("tempOps") || (!target.hasClass("tempOps") && !source.hasClass("tempOps"));
	if((target.hasClass("project") && source.hasClass("project") && tempOps) 
		|| (target.hasClass("tableNumber") && source.hasClass("tableNumber"))){
		jsPlumb.detach(info.connection);
	}
	
});

  jsPlumb.bind("connectionDetached", function(info) {
	var indexRem = calcPath.findIndex(el=> el.source === info.sourceId);
	
	if(indexRem > -1){
		calcPath[indexRem].target = undefined;
	}
});

});

var deleteEndPointsByElement = function(el){
	var endpoints = jsPlumb.getEndpoints(el);
	endpoints.forEach(function(item, i, arr){jsPlumb.deleteEndpoint(item);});
	
	if(storageData[el[0].id] !== undefined){
		delete storageData[el[0].id];
	}
	
	var indexRem = calcPath.findIndex(e=> e.source === el.id);
	
	if(indexRem > -1){
		calcPath.splice(indexRem, 1);
	}
	
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
			
var addDraggableElementEndPoint = function(el, type){
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
	calcPath.push(new СalcPathEl(el[0].id, undefined, type));
};


var createFormulsList = function(){
	
	var formuls = {};
	calcPath.map(el=>formuls[el.source] = "");
	
	calcPath.forEach(function(element, index, array){
		var indexRem = array.findIndex(e=> e.target === element.source);
		
		if(indexRem > -1){
			delete formuls[element.source];
		}
	});
	
	if(Object.keys(formuls).length == 0){
		return [];
	}
	var resStr = [];
	Object.keys(formuls).forEach(function(key, id){
		
		var err = false;
		var arr = [];
		createPath(arr, key, err);
		
		if(!err){
			var resArr = [];
			arr.forEach(function(element, index, array){
				var indexRem = calcPath.findIndex(el=> el.source === element);
	
				if(indexRem > -1){
					
					switch(calcPath[indexRem].type){
						case 'add':
							resArr.push('+');
						break;
						case 'mul':
							resArr.push('*');
						break;
						case 'sub':
							resArr.push('-');
						break;
						case 'div':
							resArr.push('/');
						break;
						case 'temp':
							resArr.push('->');
							resArr.push(element);
						break;
						case 'tableNumber':
							resArr.push(element);
						break;
					}
				}
			});
			formuls[key] = resArr.join('');
			resStr.push(formuls[key]);
		}else{
			//ошибка
		}
		
	});
	
	//formuls ассоциативный массив с формулами
	alert('['+resStr.join('][')+']');
		
};


var createPath = function(arr, el, err){
		if(err)
			return;
		
		var indexRem = arr.indexOf(el);
		if(indexRem > -1){
			alert('Зацикливание!');
			err = true;
			return;
		}
		
		indexRem = calcPath.findIndex(e=> e.source === el);
	
		if(indexRem > -1){
			arr.push(el);
			if(calcPath[indexRem].target === undefined){
				return;
			}
			else {
				createPath(arr, calcPath[indexRem].target, err);
			}
		}else{
			alert('Нет элемента!');
			err = true;
			return;
		}
};


