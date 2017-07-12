var i =1;



var menuContextConfig = [{
        name: 'update',
        img: 'img/add.png',
        title: 'update button',
        fun: function () {
            alert('i am update button');
        }
    }, {
        name: 'delete',
        img: 'img/remove.png',
        title: 'delete button',
        fun: function () {
            alert('i am delete button');
        }
    }];
	
	
var Init = function(){

$("#nav").on('click','.btnNav',function(e) {
  
    var id = e.currentTarget.getAttribute("id");
	var cl = {};
	cl["add"] = "glyphicon glyphicon-plus";
	cl["sub"] = "glyphicon glyphicon-minus";
	cl["mul"] = "glyphicon glyphicon-remove";
	cl["div"] = "glyphicon glyphicon-italic";
	cl["temp"] = "glyphicon glyphicon-search";
	
	var newAgent = $('<div>').attr('id', id + i).addClass('project').addClass('absoluteEl');
	var newSpan = $('<span>').attr('id', "span" + id + i).addClass(cl[id]);
	newAgent.text(id + i);
	$('#workzone').append(newAgent);
	$('#' + id + i).append("<br>");
	$('#' + id + i).append(newSpan);
	
	$('#' + id + i).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});

    addDraggableElementEndPoint(newAgent);
	
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


var previewFile = function(){
        var file = document.querySelector('input[type=file]').files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
            console.log(reader.result);
            var data = JSON.parse(reader.result);
            console.log(data);

            data.forEach(function (item) {
                item.id = item.type + '_' + item.name
            });

            console.log(data);

            var toolBar = document.getElementById('toolBar'),
                frag = document.createDocumentFragment();

            data.forEach(function (item) {

                var el = document.createElement("div");
                el.id = item.id;
                el.className = "draggable tableNumber";
                el.ondblclick = function () {
                    window.open('edit.html', '', ' scrollbars=yes,menubar=no,width=500, resizable=yes,toolbar=no,location=no,status=no');
                };
				
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

					addDraggableElementEndPoint(newAgent);
					
					i++;
			    };
                var txt = document.createTextNode(item.name + '(' + item.type + ')');
                el.appendChild(txt);
                frag.appendChild(el);
				
				
            });
            toolBar.appendChild(frag);
			
			$('#toolBar').find('.tableNumber').each(function( i, el ) {
				$("#" + el.getAttribute("id")).contextMenu(menuContextConfig,{triggerOn:'contextmenu'});
			});


        }, false);

        if (file) {
            reader.readAsText(file);
        }
    };