var i =1;



var menuContextConfig = [{
        name: 'update',
        img: 'img/add.png',
        title: 'update button',
        fun: function (e1,e2) {
			$("#elementId").val(e1.trigger[0].id);
            $("#myModal").modal('show');
        }
    }, {
        name: 'delete',
        img: 'img/remove.png',
        title: 'delete button',
        fun: function (e1,e2) {
			deleteEndPointsByElement($('#' + e1.trigger[0].id), true);
        }
    }];
	
var formElementToTransfer = function(el){
	var element = el.source === undefined ? el : storageData[el.source];
	
	var resData = {};
	resData["name"] = element.name;
	resData["type"] = element.type;
	resData["value"] = element.value;
	
	if(element.type === "table"){
		resData["columns"] = element.columns;
	}
	return resData;
}

var formElementToTransferLoad = function(el){
	
	var resData = {};
	resData["name"] = el.name;
	resData["type"] = el.type;
	
	if(el.source !== undefined){
	   resData["source"] = el.source;
	}else{
		resData["value"] = el.value;
	}
	if(el.type === "table"){
		el["columns"] = el.columns;
	}
	return resData;
}
	
	
var filtersModal = {};
var filters = [];
var sources = [];
var getTableFilter = function(){
	var id = $('#elementId').val();
	if(storageData[id] !== undefined){	
		switch(storageData[id].type){
			case "table":
			case "temp":
			var sData = storageData[id].source == undefined ? storageData[id] : storageData[storageData[id].source];
			var data = Array.from($('#example').DataTable().data());
			sData.value = data;
			//обновим на сервере
			updateData(
			formElementToTransfer(sData),
			"save_data",
			sessionID
			);
			if(storageData[id].filter !== undefined){
				Object.keys(storageData[id].filter).forEach(function(key, i){
					var item = storageData[id].filter[key];
					if(item !== undefined){
						var val = $('#' + key).val();
						val = val === undefined ? '' : val;
						var foundCmpSymbols = val.includes('>') || val.includes('<') || val.includes('=');
						var ops = foundCmpSymbols ? val.substr(0, 1) : '';
						val = foundCmpSymbols ? val.substr(1, val.length - 1) : val;
						item.value = (item.type === 'datetime' ? normalizeDate(val) : val);
						item.operation = ops;
						if(val !== ''){
							if(item.operation !== ''){
								
								filters.push(id + '.' + key + item.operation + ((item.type === 'string' || item.type === 'datetime') ? '"' + item.value + '"': item.value));
							}else{
								// filters.push('CAST(' + id + '.' + key  + ' as varchar) like "%'+ item.value + '%"');
								filters.push({id : item.value});
							}
						}
					}		
				});
			}
			alert('[' + filters.join(' AND ') + ']');
			break;
			case "long":
			case "double":
			    var sData = storageData[id].source == undefined ? storageData[id] : storageData[storageData[id].source];
				sData.value = $('#input_' + sData.name).val();
				//обновим на сервере
				updateData(
				formElementToTransfer(sData),
				"save_data",
				sessionID
				);
			break;
		}
	}
	$('#myModal').modal('hide');
};

var normalizeDate = function(dateString) {
  if(dateString === '')
	  return ''
  var date = new Date(dateString);
  var normalized = date.getFullYear() + '' + (("0" + (date.getMonth() + 1)).slice(-2)) + '' + ("0" + date.getDate()).slice(-2);
  return normalized;
};
//======================SAVE==================================
var saveCurrentState = function(){
	var exportData = [];
	Object.keys(storageData).forEach(function(key){
		var clNode = JSON.parse(JSON.stringify(storageData[key]));
		clNode["position"] = {dx: $('#' + key).position().left,dy:$('#' + key).position().top};
		
		var indexRem = calcPath.findIndex(el=> el.source === key);
		if(indexRem > -1){
			clNode["isWorkZone"] = true;
			clNode["target"] = calcPath[indexRem].target;
		}else{
			clNode["isWorkZone"] = false;
		}
		
		exportData.push(clNode);
	});
	
	var blob = new Blob([JSON.stringify(exportData)], {type: "application/json"});

	var saveAs = window.saveAs;
	saveAs(blob, 'exportSchema_' + (new Date().toLocaleString() +'.json'));
};



//===============================================================
	
var Init = function(){
//до отправки данных на сервер кнопки недоступны
$("#validate").prop('disabled', true);
$("#run").prop('disabled', true);
$("#sendData").prop('disabled', true);
	
$('#filterAccept').click(getTableFilter);

$('#save').click(saveCurrentState);

$('#sendData').click(sendDataToServer);
	
//========model window===========
$('#myModal').on('shown.bs.modal', function (event) {

});

    function createFilters(val, newTable) {
        var thead = $('#example thead');
		var trForInput = $('<tr>');
		thead.append(trForInput);
        newTable.append(thead);
        for (var i = 0; i < storageData[val].columns.length; i++) {

            if (storageData[val] !== undefined) {
				var thForInput = $('<th id = "thFilters" style="padding:2px">');
                var thInput = $('<input type="text" value="" style="width:100%">');
                var colName = storageData[val].columns[i].name;
				var colType = storageData[val].columns[i].type;
                thInput.attr("id", colName);
				thForInput.append(thInput);
                trForInput.append(thForInput);
				if(storageData[val].filter === undefined 
					|| storageData[val].filter === {} 
					|| storageData[val].filter[colName] === undefined){
					storageData[val].filter[colName] = {index: i, type: colType, value: '', operation: ''};
				}else{
					var newValue = storageData[val].filter[colName].operation + storageData[val].filter[colName].value;
					thInput.val(newValue);
					$("#example").dataTable().fnFilter((storageData[val].filter[colName].operation !== '' ? '' : newValue), storageData[val].filter[colName].index);
				}
				$('#' + colName).keyup(function() {
				 var valEl = $('#elementId').val();
				 var indexFilter = storageData[valEl].filter[$(this).attr('id')];
				 if(indexFilter !== undefined){
					var val = $(this).val();
					var foundCmpSymbols = val.includes('>') || val.includes('<') || val.includes('=');
					//indexFilter.value = foundCmpSymbols ? val.substr(1, val.length - 1) : val;
					//indexFilter.operation = foundCmpSymbols ? val[0] : '';
					$("#example").dataTable().fnFilter((foundCmpSymbols ? '' : $(this).val()), indexFilter.index);
				 } 
				});
            }
        }
        var data = storageData;
		
    }

// при открытии модального окна
    $('#myModal').on('show.bs.modal', function (event) {
  var val = $('#elementId').val();
  
  var newDiv = $('<div>').attr('id', "div" + val);

  var newTable = $('<table>').attr('id', "example").addClass("display");
  newDiv.append(newTable);
  newDiv.appendTo('#modal-body');
  $('#example')[0].style.width = "100%";
  if(storageData[val] !== undefined){//временное условие, для открытия temp таблиц
	  var sData = storageData[val].source == undefined ? storageData[val] : storageData[storageData[val].source];
	  switch(sData.type){
		  case 'table':
				  function newTitle(x){var el = {title: x}; return el;}
				  var tableColumns = sData.columns.map(c=>newTitle(c.name));
				  
				  var myTable = $('#example').DataTable({
					  "ordering": false,
					  "sPaginationType": "full_numbers",
					  data: sData.value,
					  columns: tableColumns,
					  dom: 'Bfrtip',
					  select: 'single',
					  responsive: true,
					  altEditor: true,
					  buttons: [{
						text: 'Add',
						name: 'add'
					  },
					  {
						extend: 'selected',
						text: 'Edit',
						name: 'edit'
					  },
					  {
						extend: 'selected',
						text: 'Delete',
						name: 'delete'
					 }]

					});
					createFilters(val, newTable);
		  break;
		  	case "long":
			case "double":
			$("#example").html('<tr><td align="center"><input id="input_'+ sData.name +'" type="text" value="'+ sData.value +'" style="width:100%"></input><td></tr>');
		  break;
	  }
  }
});

    function mainCompare(compareChar, compareValue, rowValue, match, searchValue) {
        switch (compareChar) {
            case '<':
                if (compareValue > rowValue) match = true;
                break;
            case '>':
                if (compareValue < rowValue) match = true;
                break;
            case '=':
                if (compareValue == rowValue) match = true;
                break;
            default:
                if (searchValue == rowValue) match = true;
        }
        return match;
    }

    jQuery.extend($.fn.dataTableExt.afnFiltering.push(
        function (oSettings, aData, iDataIndex) {
            var inputFilters = [];
            var val = $('#elementId').val();
            for (i = 0; i < storageData[val].columns.length; i++) {
                inputFilters[i] = {
                    iColumn: i,
                    elementId: storageData[val].columns[i].name.valueOf(),
                    type: storageData[val].columns[i].type.valueOf()};
            }
            var match = true;
            for (i = 0; i < inputFilters.length; i++) {
                var value = jQuery('#' + inputFilters[i].elementId).val();
				var foundCmpSymbols = value !== undefined && (value.includes('>') || value.includes('<') || value.includes('='));
				if(foundCmpSymbols){
					switch (inputFilters[i].type) {
						case 'double':
						case 'long':
							if (value && match) {
								countFilter(value, aData[inputFilters[i].iColumn]);
							}
							break;
						case 'string':
							if (value && match) {
								compareString(value, aData[inputFilters[i].iColumn]);
							}
							break;
						case 'datetime':
							if (value && match) {
								compareDateTime(value, aData[inputFilters[i].iColumn]);
							}
							break;
					}
				}
            }

            function countFilter(searchValue, rowValue) {
                var compareCharExt = searchValue.charAt(0);
                var compareValueExt = parseFloat(searchValue.substr(1, searchValue.length - 1).replace(',', '.'));
                var rowValueExt = parseFloat(rowValue.replace(',', '.'));
                match = false;
                match = mainCompare(compareCharExt, compareValueExt, rowValueExt, match, searchValue);
            }

            function compareString(searchValue, rowValue) {
                var compareCharExt = searchValue.charAt(0);
                var compareValueExt = searchValue.substr(1, searchValue.length - 1).toLowerCase();
                var rowValueExt = rowValue.toLowerCase();
                match = false;
                match = mainCompare(compareCharExt, compareValueExt, rowValueExt, match, searchValue);
            }

            function compareDateTime(searchValue, rowValue) {
                var compareCharExt = searchValue.charAt(0);
				var searchValueExt = searchValue.substr(1, searchValue.length - 1);
                var compareValueExt = normalizeDate(searchValueExt === '' ? '1900/01/01' : searchValueExt);
				var rowValueExt = normalizeDate(rowValue === '' ? '1900/01/01' : rowValue);

                match = false;
                match = mainCompare(compareCharExt, compareValueExt, rowValueExt, match, rowValueExt);
            }

            return match;
        }
        )
    );
	

$('#myModal').on('hidden.bs.modal', function () {
  
  var val = $('#elementId').val();
  $('#div' + val).remove();
  $('#elementId').val(-1);
  
});
//===============================

$("#nav").on('click','.btnNav',function(e) {
  
    var id = e.currentTarget.getAttribute("id");
	var cl = {};
	cl["add"] = "glyphicon glyphicon-plus";
	cl["sub"] = "glyphicon glyphicon-minus";
	cl["mul"] = "glyphicon glyphicon-remove";
	cl["div"] = "glyphicon glyphicon-italic";
	cl["temp"] = "glyphicon glyphicon-search";
	
	var newAgent = $('<div>').attr('id', id + i).addClass('absoluteEl');
	if(id == "temp"){
		newAgent.addClass("tempOps").addClass("tableNumber");
	}else{
		newAgent.addClass("project");
	}
	var newSpan = $('<span>').attr('id', "span" + getRandomInt(1,10) + id ).addClass(cl[id]);
	newAgent.text(id + i);
	$('#workzone').append(newAgent);
	$('#' + id + i).append("<br>");
	$('#' + id + i).append(newSpan);
	
	if(id == "temp"){
		$('#' + id + i).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});
	}
	storageData[id + i] = new DataSourceEl(id + i, undefined, id, undefined, undefined, undefined, undefined, true);

    addDraggableElementEndPoint(newAgent, id);
	
    i++;
		
  });

  $("#workzone").on('click','.absoluteEl',function(e) {
  
    var id = e.currentTarget.getAttribute("id");
	if($("#" + id).hasClass( "border" )){
		$("#" + id).removeClass('border');
	}else{
		$("#" + id).addClass('border');
	}
	
	});
	
  $("#trash").click(function(){
   $('#workzone').find('.absoluteEl').each(function( i, el ) {
		var e = $("#" + el.getAttribute("id"));
		
		if(e.hasClass( "border" )){
            deleteEndPointsByElement(e, true);
		}
	});
  });

};

function DataSourceEl(name, source, type, columns, value, filter, target, isWorkZone){
	this.name = name;
	this.source = source;
	this.type = type;
	this.columns = columns;
	this.value = value;
	this.filter = filter;
	this.target = target;
	this.isWorkZone = isWorkZone;
}	

var storageData = {};

var previewFile = function(){
        var file = document.querySelector('input[type=file]').files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
        console.log(reader.result);
		try{
            var data = JSON.parse(reader.result);
			
			
			Object.keys(storageData).forEach(function(item, i, arr){ 
				if(storageData[item] !== undefined){
					var indexRem = data.findIndex(el=> el.name === item);
		
					if(indexRem == -1){
						deleteEndPointsByElement($('#'+item), true);
					}	
				}				
			});

            data.sort(function(a,b){//сначала обработаем источники
				if(a.source !== undefined && b.source === undefined){
					return 1;
				}else{
					return -1;
				}
			}).forEach(function (item) {
			
					var type = item.source !== undefined && storageData[item.source] !== undefined ? storageData[item.source].type : item.type;
					switch(type){
						case "table":
						case "long":
						case "double":
						case "temp":
							var filter = {};
							if(item.filter !== undefined || item.source !== undefined){
								if(item.source !== undefined){
									filter = JSON.parse(JSON.stringify(storageData[item.source].filter));
								}else{
									Object.keys(item.filter).forEach(function(elFilter){
										var fakeElFilter = {index: -1, type: '', value: '', operation: ''};
										
										var colIndex = item.columns.findIndex(function(e, i, arr){return e.name === elFilter});
										if(colIndex > -1){
											fakeElFilter.type = item.columns[colIndex].type;
											fakeElFilter.index = colIndex;
											fakeElFilter.value = item.filter[elFilter].value;
											fakeElFilter.operation = item.filter[elFilter].operation !== undefined ? item.filter[elFilter].operation : '';
											filter[elFilter] = fakeElFilter;
										}else{
											throw 'Некорректный фильтр у таблицы' + item.name;
										}
									});
								}
							}
							//если нет элемента - создадим
							if(storageData[item.name] === undefined){
								createTempTableNumberEl(item, filter);
							}else{
								//обновим информацию о элементе
								storageData[item.name] = new DataSourceEl(item.name, undefined, item.type, item.columns, item.value, filter, item.target, item.isWorkZone);
							}
						break;
						case "add":
						case "sub":
						case "div":
						case "mul":
								createOperationEl(item);
						break;
						default:
							throw'Неизвестный тип данных!' + type;
						break;
					}
	
            });
			//теперь можно отправлять данные на сервер
			$("#sendData").prop('disabled', true);
			
			//устанавливаем связи
			Object.keys(storageData).forEach(function(key){
				if(storageData[key].target !== undefined 
				&& storageData[key].isWorkZone){
					
					var endpointSource = jsPlumb.getEndpoints($('#' + key)).find(function(el, i, arr){return el.isSource;});
					var endpointTarget = jsPlumb.getEndpoints($('#' + storageData[key].target)).find(function(el, i, arr){return el.isTarget;});
					
					jsPlumb.connect({source: endpointSource, target: endpointTarget});
				}
			});
			$("#sendData").prop('disabled', false);
			$('input[type=file]').val('');
		}catch(e){
			alert('Ошибка ' + e);
			$("#sendData").prop('disabled', true);
			$("#run").prop('disabled', true);
			$("#validate").prop('disabled', true);
		}
        }, false);

        if (file) {
            reader.readAsText(file);
        }
    };
	
var sendDataToServer = function(){
	var dataToSend = [];
    Object.keys(storageData).forEach(function(key){
    if (storageData[key].source === undefined){
        //dataToSend.push(formElementToTransferLoad(storageData[key]));
		dataToSend.push(storageData[key]);
    }
    });
    try{
		saveLoadData(dataToSend,"start_service",sessionID );
	}catch(e){
		alert('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
	}
};
	
  
//=========создание элемента===========
var arrIconsElement = {};
	arrIconsElement["add"] = "glyphicon glyphicon-plus";
	arrIconsElement["sub"] = "glyphicon glyphicon-minus";
	arrIconsElement["mul"] = "glyphicon glyphicon-remove";
	arrIconsElement["div"] = "glyphicon glyphicon-italic";
	arrIconsElement["temp"] = "glyphicon glyphicon-search";
	arrIconsElement["table"] = "glyphicon glyphicon-text-width";
	arrIconsElement["long"] = "glyphicon glyphicon-bold";
	arrIconsElement["double"] = "glyphicon glyphicon-bold";
	
var createOperationEl = function(el, onWorkZone, filter){
	var id = el.name;
	if(document.getElementById(id) === undefined 
		|| document.getElementById(id) === null){
		var newDiv = document.createElement("div");
		newDiv.id = id;
		
		var newSpan = $('<span>').attr('id', "span" + getRandomInt(1,20) + id).addClass(arrIconsElement[el.type]);
		newDiv.className = "project absoluteEl"
		$('#workzone').append(newDiv);
		$('#' + id).append("<br>");
		$('#' + id).append(newSpan);
		$('#' + id).css({top: el.position.dy, left: el.position.dx}); 
		storageData[id] = new DataSourceEl(id, undefined, el.type, undefined, undefined, undefined, el.target, el.isWorkZone);
		addDraggableElementEndPoint($('#' + id), el.type);
	}
};

var createTempTableNumberEl = function(el, filter){
	var id = el.name;
	var type  = el.source !== undefined && storageData[el.source] !== undefined ? storageData[el.source].type : el.type;
	var newDiv = document.createElement("div");
	newDiv.id = id;
	
	
	var newSpan = $('<span>').attr('id', "span" + getRandomInt(1,20) + id).addClass(arrIconsElement[el.type]);
					
	if(el.isWorkZone){
		newDiv.className = " tableNumber absoluteEl" + (type === 'temp' ? " tempOps" : "");
		var dataParent = storageData[el.source];
		if(dataParent !== undefined){
			var txt = document.createTextNode(el.name + '(' + dataParent.name + ')');
			newDiv.appendChild(txt);
			var copyFilter = JSON.parse(JSON.stringify(dataParent.filter));
			storageData[id] = new DataSourceEl(id, el.source, el.type, dataParent.columns, undefined, copyFilter, el.target, el.isWorkZone);
		}else{
			var txt = document.createTextNode(el.name);
			newDiv.appendChild(txt);
			storageData[id] = new DataSourceEl(id, undefined, el.type, el.columns, el.value, filter, el.target, el.isWorkZone);
		}
		$('#workzone').append(newDiv);
		if(el.position !== undefined){
			$('#' + id).css({top: el.position.dy, left: el.position.dx}); 
		}
		addDraggableElementEndPoint($('#' + id), type);
	}else{
		newDiv.className = "draggable tableNumber";
		var txt = document.createTextNode(el.name);
		newDiv.appendChild(txt);
		$('#toolBar').append(newDiv);
		newDiv.onclick = function(e) {
			
			var id = e.currentTarget.getAttribute("id");
			var idI = id + i;
			i++;
			var newAgentExt = $('<div>').attr('id', idI).addClass('tableNumber').addClass('absoluteEl');
			var newSpanExt = $('<span>').attr('id', "span" + getRandomInt(1,20) + idI).addClass(arrIconsElement[storageData[id].type]);
			newAgentExt.text(idI + '(' + id + ')');
							
			$('#workzone').append(newAgentExt);
			$('#' + idI).append("<br>");
			$('#' + idI).append(newSpanExt);
							
			var copyFilter = JSON.parse(JSON.stringify(storageData[id].filter));
			storageData[idI] = new DataSourceEl(idI, id, storageData[id].type, storageData[id].columns, undefined, copyFilter, undefined, true);

			addDraggableElementEndPoint($('#' + idI), storageData[id].type);
			$('#' + idI).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});
		};
		var dataParent = storageData[el.source];
		if(dataParent !== undefined){
			var copyFilter = JSON.parse(JSON.stringify(dataParent.filter));
			storageData[id] = new DataSourceEl(id, el.source, el.type, dataParent.columns, dataParent.value, copyFilter, el.target, false);
		}else{
			storageData[id] = new DataSourceEl(id, undefined, el.type, el.columns, el.value, filter, el.target, false);
		}
	}
	
	$('#' + id).append("<br>");
	$('#' + id).append(newSpan);
	//добавили контекстное меню
	$('#' + id).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});
};

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

  
//=====================================

var dataTest = [{
	"result": {
		"type": "table",
		"name": "temp1",
		"columns": [{
			"name": "result_0_0",
			"type": "long"
		}, {
			"name": "result_0_1",
			"type": "long"
		}, {
			"name": "result_0_2",
			"type": "long"
		}],
		"value": [
			[2, 4, 6],
			[8, 10, 12],
			[14, 16, 18]
		],
		
	},
	"formula": "t11+table_1->temp1"
}, {
	"result": {
	    "name": "result11",
		"type": "table",
		"columns": [{
			"name": "c1",
			"type": "long"
		}, {
			"name": "c2",
			"type": "long"
		}, {
			"name": "c3",
			"type": "long"
		}],
		"value": [
			[4, 5, 6]
		],
	},
	"formula": "t->temp2"
}];
/*
var parseResult = function(data){
	//завершим, если не массив
	if(data === undefined || !Array.isArray(data))
		return;
	data.forEach(function(el, i, arr){
		if(el["result"] !== undefined && el["result"].name !== undefined){
			var elStorage = storageData[el.result.name];
			if(elStorage !== undefined){//если это temp или повторный result 
				var id = el.result.name;
				if(id.includes('ZZZ')){//если уже отправляли, тогда обновим
					elStorage["type"] = "temp";
					elStorage["columns"] = el["result"].columns;
					elStorage["value"] = el["result"].value;
					elStorage["filter"] = {};
					var elParentStorage = storageData[storageData[id].source];
					if(elParentStorage !== undefined){
						elParentStorage["type"] = el["result"].type;
						elParentStorage["columns"] = el["result"].columns;
						elParentStorage["value"] = el["result"].value;
						elParentStorage["filter"] = {};
						$('#' + elParentStorage.name).attr('title', el.formula);
					}
					
				}else{//иначе создадим родителя
					var newId = el.result.name + "ZZZ";
					
					var indexRem = calcPath.findIndex(e=> e.source === id);
					var sourcePoint, targetPoint;
					if(indexRem > -1){
						calcPath[indexRem].source = newId;
						targetPoint = calcPath[indexRem].target;
					}
					
					indexRem = calcPath.findIndex(e=> e.target === id);
		
					if(indexRem > -1){
						calcPath[indexRem].target = newId;
						sourcePoint = calcPath[indexRem].source;
					}
					
					deleteEndPointsByElement($('#' + id), false);
					
					$('#' + id).attr('id', newId);
					
					var copyElStorage = JSON.parse(JSON.stringify(elStorage));
					copyElStorage["name"] = newId;
					copyElStorage["source"] = id;
					copyElStorage["type"] = "temp";
					copyElStorage["columns"] = el["result"].columns;
					copyElStorage["value"] = undefined;
					copyElStorage["filter"] = {};
					storageData[newId] = copyElStorage;
					
					createTempTableNumberEl(el["result"],{});
					$('#' + newId).text(newId + '(' + id + ')');
					$('#' + id).attr('title', el.formula);

					
					
					addDraggableElementEndPoint($('#' + newId), el["result"].type);
					
					if(sourcePoint !== undefined){
						var endpointSource = jsPlumb.getEndpoints($('#' + sourcePoint)).find(function(el, i, arr){return el.isSource;});
						var endpointTarget = jsPlumb.getEndpoints($('#' + newId)).find(function(el, i, arr){return el.isTarget;});
						jsPlumb.connect({source: endpointSource, target: endpointTarget});
					}
					
					if(targetPoint !== undefined){
						var endpointSource = jsPlumb.getEndpoints($('#' + newId)).find(function(el, i, arr){return el.isSource;});
						var endpointTarget = jsPlumb.getEndpoints($('#' + targetPoint)).find(function(el, i, arr){return el.isTarget;});
						jsPlumb.connect({source: endpointSource, target: endpointTarget});
					}
				}
			}else{//это result 1 раз пришел
				createTempTableNumberEl(el["result"],{});
				$('#' + el["result"].name).attr('title', el.formula);
			}
		}
	});
};
*/

var parseResult = function(data){
	//завершим, если не массив
	if(data === undefined || !Array.isArray(data))
		return;
	data.forEach(function(el, ii, arr){
		if(el["result"] !== undefined && el["result"].name !== undefined){
			var elStorage = storageData[el.result.name];
			var id = el.result.name;
			if(elStorage !== undefined){//если это temp или повторный result 
				if(elStorage.source == undefined && elStorage.isWorkZone){//если temp на WorkZone и его 1 раз отправили
					var newId = el.result.name + '_' + i;
					    i++;
						var indexRem = calcPath.findIndex(e=> e.source === id);
						var sourcePoint, targetPoint;
						if(indexRem > -1){
							calcPath[indexRem].source = newId;
							targetPoint = calcPath[indexRem].target;
						}
						
						indexRem = calcPath.findIndex(e=> e.target === id);
			
						if(indexRem > -1){
							calcPath[indexRem].target = newId;
							sourcePoint = calcPath[indexRem].source;
						}
						
						deleteEndPointsByElement($('#' + id), false);
						
						var span = $('#temp1 span');
						$('#' + id).attr('id', newId);
						
						var copyElStorage = JSON.parse(JSON.stringify(elStorage));
						copyElStorage["name"] = newId;
						copyElStorage["source"] = id;
						copyElStorage["type"] = "temp";
						copyElStorage["columns"] = el["result"].columns;
						copyElStorage["value"] = undefined;
						copyElStorage["filter"] = {};
						storageData[newId] = copyElStorage;
						
						createTempTableNumberEl(el["result"],{});
						$('#' + newId).text(newId + '(' + id + ')');
						$('#' + newId).append("<br>");
						$('#' + newId).append(span)
						$('#' + id).attr('title', el.formula);

						
						
						addDraggableElementEndPoint($('#' + newId), el["result"].type);
						
						if(sourcePoint !== undefined){
							var endpointSource = jsPlumb.getEndpoints($('#' + sourcePoint)).find(function(el, i, arr){return el.isSource;});
							var endpointTarget = jsPlumb.getEndpoints($('#' + newId)).find(function(el, i, arr){return el.isTarget;});
							jsPlumb.connect({source: endpointSource, target: endpointTarget});
						}
						
						if(targetPoint !== undefined){
							var endpointSource = jsPlumb.getEndpoints($('#' + newId)).find(function(el, i, arr){return el.isSource;});
							var endpointTarget = jsPlumb.getEndpoints($('#' + targetPoint)).find(function(el, i, arr){return el.isTarget;});
							jsPlumb.connect({source: endpointSource, target: endpointTarget});
						}
				}else{
					
					if(elStorage.source == undefined){//повторный result
						elStorage["type"] = "temp";
						elStorage["columns"] = el["result"].columns;
						elStorage["value"] = el["result"].value;
						elStorage["filter"] = {};
					}else{//temp уже отправляли, обновим temp и source
						elStorage["type"] = "temp";
						elStorage["columns"] = el["result"].columns;
						elStorage["value"] = undefined;
						elStorage["filter"] = {};
						var elParentStorage = storageData[storageData[id].source];
						if(elParentStorage !== undefined){
							elParentStorage["type"] = el["result"].type;
							elParentStorage["columns"] = el["result"].columns;
							elParentStorage["value"] = el["result"].value;
							elParentStorage["filter"] = {};
							$('#' + elParentStorage.name).attr('title', el.formula);
						}
					}
				}
			}else{//это result 1 раз пришел
				createTempTableNumberEl(el["result"],{});
				$('#' + el["result"].name).attr('title', el.formula);
			}
		}
	});
};

var checkResponse = function(response){
	var err = response[0].error;
	
	if(err !== undefined){
		alert(err);
		return false;
	}
	return true;
}