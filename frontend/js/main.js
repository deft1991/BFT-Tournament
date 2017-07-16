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
			deleteEndPointsByElement($('#' + e1.trigger[0].id));
        }
    }];
	
	
var Init = function(){
	
//========model window===========
$('#myModal').on('shown.bs.modal', function (event) {

});

    function createFilters(val, newTable) {
        var thead = $('<thead>');
        for (var i = 0; i < storageData[val].columns.length; i++) {

            if (storageData[val] !== undefined) {
                var trForText = $('<tr>');
                var trForInput = $('<tr>');

                var thText = $('<th>');
                thText.text(storageData[val].columns[i].name);
                trForText.append(thText);

                var thInput = $('<input type="text" value="">');
                var colName = storageData[val].columns[i].name;
                thInput.attr("id", colName);
                // thInput.attr("align", "left");
                trForInput.append(thInput);
                thead.append(trForText);
                thead.append(trForInput);
            }
        }
        newTable.append(thead);
    }

// при открытии модального окна
    $('#myModal').on('show.bs.modal', function (event) {
  var val = $('#elementId').val();
  var sData = storageData[val].source == null ? storageData[val] : storageData[storageData[val].source];
  var newDiv = $('<div>').attr('id', "div" + val);

  var newTable = $('<table>').attr('id', "example").addClass("display");
  newDiv.append(newTable);
  newDiv.appendTo('#modal-body');
  $('#example')[0].style.width = "100%";
  switch(storageData[val].type){
	  case 'table':
			  function newTitle(x){var el = {title: x}; return el;}
			  var tableColumns = sData.columns.map(c=>newTitle(c.name));
			  var dataTableConf = {};
			  dataTableConf["data"] = sData.value;
			  dataTableConf["columns"] = tableColumns;
			  $("#example").DataTable(dataTableConf);
	  break;
	  case 'number':
		$("#example").html('<tr><td align="center"><input type="text" value="'+ sData.value +'" style="width:100%"></input><td></tr>');
	  break;
  }
        createFilters(val, newTable);
    // $('#Salary').keyup(function() {
    //     newTable.fnFilter($(this).val(), 0);
    // });
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
                switch (inputFilters[i].type) {
                    case 'number':
                        if (value && match) {
                            countFilter(value, aData[inputFilters[i].iColumn]);
                        }
                        break;
                    case 'long':
                        if (value && match) {
                            longFilter(value, aData[inputFilters[i].iColumn]);
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

            function countFilter(searchValue, rowValue) {
                var compareChar = searchValue.charAt(0);
                var compareValue = parseFloat(searchValue.substr(1, searchValue.length - 1));
                rowValue = (jQuery(rowValue).text()) ? jQuery(rowValue).text() : rowValue;
                match = false;
                match = mainCompare(compareChar, compareValue, rowValue, match, searchValue);
            }

            function longFilter(searchValue, rowValue) {
                var compareChar = searchValue.charAt(0);
                var compareValue = searchValue.substr(1, searchValue.length - 1);
                compareValue = compareValue.replace(",", "");
                compareValue = parseFloat(compareValue);
                rowValue = (jQuery(rowValue).text()) ? jQuery(rowValue).text() : rowValue;
                rowValue = rowValue.replace(",", "");
                match = false;
                match = mainCompare(compareChar, compareValue, rowValue, match, searchValue);
            }

            function compareString(searchValue, rowValue) {
                var compareChar = searchValue.charAt(0);
                var compareValue = searchValue.substr(1, searchValue.length - 1);
                rowValue = (jQuery(rowValue).text()) ? jQuery(rowValue).text() : rowValue;
                match = false;
                match = mainCompare(compareChar, compareValue, rowValue, match, searchValue);
            }

            function compareDateTime(searchValue, rowValue) {
                var compareChar = searchValue.charAt(0);
                var compareValue = new Date();
                if (compareChar == ">" || compareChar == "<") {
                    var compareArr = searchValue.substr(1, searchValue.length - 1).split("/");
                    compareValue.setFullYear(compareArr[0], compareArr[1] - 1, compareArr[2]);
                }

                var fromForm = rowValue.split("/");
                var formDate = new Date();
                formDate.setFullYear(fromForm[0], fromForm[1] - 1, fromForm[2]);

                var fromInput = searchValue.split("/");
                var seachDate = new Date();
                seachDate.setFullYear(fromInput[0], fromInput[1] - 1, fromInput[2]);

                match = false;
                match = mainCompare(compareChar, compareValue.getTime(), formDate.getTime(), match, seachDate.getTime());
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
	
	var newAgent = $('<div>').attr('id', id + i).addClass('project').addClass('absoluteEl');
	if(id == "temp")
		newAgent.addClass("tempOps");
	var newSpan = $('<span>').attr('id', "span" + id + i).addClass(cl[id]);
	newAgent.text(id + i);
	$('#workzone').append(newAgent);
	$('#' + id + i).append("<br>");
	$('#' + id + i).append(newSpan);
	
	if(id == "temp")
		$('#' + id + i).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});

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
            deleteEndPointsByElement(e);
		}
	});
  });

};

function DataSourceEl(source, value, type, columns){
	this.source = source;
	this.value = value;
	this.type = type;
	this.columns = columns;
}	

var storageData = {};

var previewFile = function(){
        var file = document.querySelector('input[type=file]').files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            console.log(reader.result);
            var data = JSON.parse(reader.result);

            var toolBar = document.getElementById('toolBar'),
                frag = document.createDocumentFragment(), foundNew = false;
				
			Object.keys(storageData).forEach(function(item, i, arr){ 
				if(storageData[item].source === undefined){
					var indexRem = data.findIndex(el=> (el.type + '_' + el.name) === item);
		
					if(indexRem == -1){
						deleteEndPointsByElement($('#'+item));
					}	
				}				
			});

            data.forEach(function (item) {
			
			    item.id = item.type + '_' + item.name;
				
				//если нет элемента - создадим
				if(storageData[item.id] === undefined){
				    storageData[item.id] = new DataSourceEl(undefined, item.value, item.type, item.columns);
					var el = document.createElement("div");
					el.id = item.id;
					el.className = "draggable tableNumber";
					
					el.onclick = function(e) {
						var id = e.currentTarget.getAttribute("id");
						var cl = "";
						if(id.includes("table")) cl = "glyphicon glyphicon-text-width";
						if(id.includes("number")) cl = "glyphicon glyphicon-bold";
						
						var newAgent = $('<div>').attr('id', id + i).addClass('tableNumber').addClass('absoluteEl');
						var newSpan = $('<span>').attr('id', "span" + id + i).addClass(cl);
						newAgent.text(id);
						
						$('#workzone').append(newAgent);
						$('#' + id + i).append("<br>");
						$('#' + id + i).append(newSpan);
						
						$('#' + id + i).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});
						
						storageData[id + i] = new DataSourceEl(id, undefined, storageData[id].type, storageData[id].columns);

						addDraggableElementEndPoint(newAgent, "tableNumber");
						
						i++;
					};
					var txt = document.createTextNode(item.name + '(' + item.type + ')');
					el.appendChild(txt);
					frag.appendChild(el);
					foundNew = true;
				}else{
					//обновим информацию о элементе
					storageData[item.id] = new DataSourceEl(undefined, item.value, item.type, item.columns);
				}
				
            });
			if(foundNew)
				toolBar.appendChild(frag);
			
			$('#toolBar').find('.tableNumber').each(function( i, el ) {
				$("#" + el.getAttribute("id")).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});
			});
			$('input[type=file]').val('');

        }, false);

        if (file) {
            reader.readAsText(file);
        }
    };