var calcPath = [];

function СalcPathEl(source, target, type){
	this.source = source;
	this.target = target;
	this.type = type;
}
		
jsPlumb.ready(function() {

  jsPlumb.Defaults.Container=$("#workzone");
  jsPlumb.Defaults.PaintStyle = { strokeStyle:"gray", lineWidth:2 };
  jsPlumb.Defaults.EndpointStyle = { radius:9, fillStyle:"gray" };
  jsPlumb.importDefaults({Connector : [ "Bezier", { curviness:50 } ]});
  jsPlumb.Defaults.ConnectionOverlays = [
            [ "Arrow", {
                location: 0.5,
				direction: 1,
                visible:true,
                width:15,
                length:15,
                id:"ARROW"
            }]];   
   
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
	
	var tempOps = (target.hasClass("tempOps") && !source.hasClass("tempOps")) ||(!target.hasClass("tempOps") && source.hasClass("tempOps"));
	if(!tempOps && ((target.hasClass("project") && source.hasClass("project")) 
		|| (target.hasClass("tableNumber") && source.hasClass("tableNumber")))){
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

var deleteEndPointsByElement = function(el, isDeleteElem){
	var endpoints = jsPlumb.getEndpoints(el);
	if(endpoints !== undefined)
		endpoints.forEach(function(item, i, arr){jsPlumb.deleteEndpoint(item);});
	
	
	var childs = [];
	var id = el[0].id === undefined ? el.id : el[0].id;
	Object.keys(storageData).forEach(function(item, i, arr){ 
		if(storageData[item].source == id)
			deleteEndPointsByElement($('#'+item), isDeleteElem);
	});
	
	var indexRem = calcPath.findIndex(e=> e.source === id);
	
	if(indexRem > -1){
		calcPath.splice(indexRem, 1);
	}
	
	storageData[id].target = undefined;
	
	if(isDeleteElem){
	delete storageData[id];
		el.remove();
	}
};





var anEndpointSource = {
        endpoint: "Dot",
        isSource: true,
        isTarget: false,
        maxConnections: 1,
        anchor: [0.95,0.5,0,0]
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
	var filters = [];
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
						case 'table':
						case 'long':
						case 'double':
							var obj = {};
							obj["name"] = element;
							obj["type"] = storageData[element].type;
							if(storageData[element].source !== undefined){
								obj["source"] = storageData[element].source;
							}
							var filterEl = [];
							var fFilter = false;
							Object.keys(storageData[element].filter).forEach(function(e,i,arr){
								if(storageData[element].filter[e].value !== "" && storageData[element].filter[e].value !== undefined){
									filterEl.push({name:e,operation: storageData[element].filter[e].operation,value: storageData[element].filter[e].value,type: storageData[element].filter[e].type});
									fFilter = true;
								}
							});
							if(fFilter){
								obj["filter"] = filterEl;
							}
                            if (!~obj.name.indexOf("result")) {
                                filters.push(obj);
                                resArr.push(element);
                            }
                            break;
					}
				}
			});
            if (!~key.indexOf("result")) {
                formuls[key] = resArr.join('');
                resStr.push(formuls[key]);
            }
		}else{
			//ошибка
		}
		var data = storageData;
	});
    var dataLoad = {"formuls":resStr,"filters":filters};
	console.log(JSON.stringify(dataLoad));
    saveCalculate(dataLoad,"calculate", sessionID);
	//formuls ассоциативный массив с формулами
	//alert('['+resStr.join('][')+']');
		
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


