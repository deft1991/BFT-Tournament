
var serviceURL = "http://172.21.10.31:8089/TournamentServer/servletexam/mainServlet?action=";
var sessionID;

function getPaths() {
    console.log('display paths');
    var name = JSON.stringify(items);
    console.log(name);
    $.ajax({
        url: serviceURL + "start_service",
        type: 'GET',
        crossDomain: true,
        dataType: "json", // data type get back from server
        data: {"data": name}, //data sent to server
        success: function (data, textStatus, jqXHR) {
			if(checkResponse(data)){
				sessionID = data[0].sessionId;
				alert('getPaths created successfully. SessionID = ' + data[0] );
			}
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Path Finder : ' + textStatus);
        }
    });
}

function saveLoadData(dataLoad,action,sessionId) {
        console.log('display paths');
        console.log(dataLoad);
        $.ajax({
            url: serviceURL +action + "&sessionId="+sessionID,
            type: 'GET',
            crossDomain: true,
            dataType: "json", // data type get back from server
            data: {"data": JSON.stringify(dataLoad)}, //data sent to server
            success: function (data, textStatus, jqXHR) {
				if(checkResponse(data)){
                    sessionID = data[0].sessionId;
					alert('saveLoadData(). SessionID = ' +sessionID);
					$("#validate").prop('disabled', false);
					$("#run").prop('disabled', false);
				}
            },
            error: function (jqXHR, textStatus, data) {
                alert('Path Finder : ' + data[0].error);
            }
        });
}
	
function updateData(dataLoad,action,sessionId) {
    console.log('updateData(dataLoad,action,sessionId): ' + dataLoad);
    $.ajax({
        url: serviceURL +action + "&sessionId="+sessionID,
        type: 'GET',
        crossDomain: true,
        dataType: "json", 
        data: {"data": JSON.stringify(dataLoad)},
        success: function (data, textStatus, jqXHR) {
			alert('updateData. Update succsess. ' +data[0].value);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Path Finder : ' + textStatus);
        }
    });
}
function saveCalculate(dataLoad,action,sessionId) {
    console.log('display paths');
    console.log(dataLoad);
    $.ajax({
        url: serviceURL +action + "&sessionId="+sessionID,
        type: 'GET',
        crossDomain: true,
        dataType: "json", // data type get back from server
        data: {"data": JSON.stringify(dataLoad)}, //data sent to server
        success: function (data, textStatus, jqXHR) {
            if(checkResponse(data)){
				parseResult(data);
				alert('saveCalculate(). Formuls calculate success');
			}
        },
        error: function (jqXHR, textStatus, data) {
            // добавить вывод корректной ошибки
            alert('АХТУНГ!!:?!?!%* WTF : ' + data[0].error);
        }
    });
}

function checkCalculate(dataLoad,action,sessionId) {
    console.log('display paths');
    console.log(dataLoad);
    $.ajax({
        url: serviceURL +action + "&sessionId="+sessionID,
        type: 'GET',
        crossDomain: true,
        dataType: "json", // data type get back from server
        data: {"data": JSON.stringify(dataLoad)}, //data sent to server
        success: function (data, textStatus, jqXHR) {
            if(checkResponse(data)){
//                parseResult(data);
                alert('checkCalculate(). Formuls calculate success');
            }
        },
        error: function (jqXHR, textStatus, data) {
            // добавить вывод корректной ошибки
            alert('АХТУНГ!!:?!?!%* WTF : ' + data[0].error);
        }
    });
}

var checkResponse = function(response){
	var err = response[0].error;
	
	if(err !== undefined){
		alert(err);
		return false;
	}
	return true;
}

var sendDataToServer = function(){
	var dataToSend = [];
    Object.keys(storageData).forEach(function(key){
    if (storageData[key].source === undefined){
		dataToSend.push(storageData[key]);
    }
    });
    try{
		saveLoadData(dataToSend,"start_service",sessionID );
	}catch(e){
		alert('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
	}
};