
var http = require('http');
var url = require('url');
var mysql = require('mysql');
var express = require('express');
var server = express();
server.use('/', express.static(__dirname + '/'));


var con = mysql.createConnection({
  host: "localhost",
  user: "tese",  //colocar "tese" ou "root"
  password: "581995",
  database: "tese"
});


server.get('/code/', function(req,res){
	res.writeHead(200, {'Content-Type': 'text/html'});
  	/*Use the url module to turn the querystring into an object:*/
  	var q = url.parse(req.url, true).query; //como fazer input de dados, em vez de ir buscar ao url
  	//console.log (q);
  
	txt = "Conversao= " + q.conversion + "input= " + q.input;
	switch(q.conversion) {
	        case "ICD10toICD9":
	        	consulta="SELECT D1.code as C10, D1.description as D10, D2.code as C9, D2.description as D9 FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv='ICD10CM' and D1.code LIKE '" + q.input + "%' and D2.conv LIKE 'ICD9CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "ICD9toICD10":
	            consulta="SELECT D1.code as C9, D1.description as D9, D2.code as C10, D2.description as D10 FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'ICD9CM' and D1.code LIKE '" + q.input + "%' and D2.conv LIKE 'ICD10CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "SCTtoICD10":
	            consulta="SELECT D1.code as CSCT, D1.description as DSCT, D2.code as C10, D2.description as D10, C.map_Advice as mapAdvice FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'SCT' and D1.code LIKE '" + q.input + "%' and D2.conv LIKE 'ICD10CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "SCTtoICD9":
	            consulta="SELECT D1.code as CSCT, D1.description as DSCT, D2.code as C9, D2.description as D9 FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'SCT' and D1.code LIKE '" + q.input + "%' and D2.conv LIKE 'ICD9CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "ICD9toSCT":
	            consulta="SELECT D1.code as C9, D1.description as D9, D2.code as CSCT, D2.description as DSCT FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'ICD9CM' and D1.code LIKE '" + q.input + "%' and D2.conv LIKE 'SCT' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  		  	break;
	}


	con.connect(function(err) {
	  	con.query(consulta, function (err, result) {
	    	if (err) throw "NO CONNECTION TO DATABASE";
	    	//console.log(result);
	    	//console.log(consulta);
	    	txt="";


		
			if(result.length==0){
				txt = '<br> No results';

			} else {
				for(var i=0; i<result.length;i++){
					switch(q.conversion) {
						case "ICD10toICD9":
							txt += '<tr><td style="border:1px solid #ddd; padding-left:5px;">'+ result[i].C10+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].D10+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C9 +'</td><td style="border:1px solid #ddd; padding:8px;padding-left:5px;">' +  result[i].D9 +'</td></tr>' ;
							break;
						case "ICD9toICD10":
							txt+='<tr><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].D9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C10 +'</td><td style="border:1px solid #ddd;padding-left:5px;">' +  result[i].D10 +'</td></tr>';
							break;
						case "SCTtoICD10":
							txt += '<tr><td style="border:1px solid #ddd;padding-left:5px;">' + result[i].CSCT+ '</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].DSCT+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].C10 + '</td><td style="border:1px solid #ddd;padding-left:5px;">'+  result[i].D10+ '</td><td style="border:1px solid #ddd;padding-left:5px;padding-left:5px;">'+ result[i].mapAdvice+'</td></tr>';
							break;
						case "SCTtoICD9":
							txt += '<tr><td style="border:1px solid #ddd;padding-left:5px;">' + result[i].CSCT+ '</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].DSCT+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].C9 + '</td><td style="border:1px solid #ddd;padding-left:5px;">'+  result[i].D9+'</td></tr>';
							break;
						case "ICD9toSCT":
							txt += '<tr><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].D9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].CSCT + '</td><td style="border:1px solid #ddd;padding-left:5px;">'+  result[i].DSCT+'</td></tr>';
							break;
					}	
				}

				switch(q.conversion) {
						case "ICD10toICD9":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD10</th><th style="text-align: center;border: 1px solid #ddd;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;">Description</th><th style="text-align: center;border: 1px solid #ddd;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;">ICD9</th><th style="text-align: center;border: 1px solid #ddd;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color:white;">Description</th></tr>'+txt+'</table>';
							break;
						case "ICD9toICD10":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD9</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD10</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th></tr>'+txt+'</table>';
							break;
						case "SCTtoICD10":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">SCT</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD10</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Advice</th></tr>'+txt+'</table>';
							break;
						case "SCTtoICD9":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">SCT</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD9</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th></tr>'+txt+'</table>';
							break;
						case "ICD9toSCT":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD9</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">SCT</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th></tr>'+txt+'</table>';
							break;
				}
			}

			
			res.end(txt);
		});


	});
});

server.get('/term/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
  	/*Use the url module to turn the querystring into an object:*/
  	var q = url.parse(req.url, true).query; //como fazer input de dados, em vez de ir buscar ao url
  	//console.log (q);
  
	txt= "Conversao=" + q.conversion + "name=" + q.name;
		switch(q.conversion) {
				case "ICD10toICD9":
	        	consulta="SELECT D1.code as C10, D1.description as D10, D2.code as C9, D2.description as D9 FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv='ICD10CM' and D1.description LIKE '%" + q.name + "%' and D2.conv LIKE 'ICD9CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "ICD9toICD10":
	            consulta="SELECT D1.code as C9, D1.description as D9, D2.code as C10, D2.description as D10 FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'ICD9CM' and D1.description LIKE '%" + q.name + "%' and D2.conv LIKE 'ICD10CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "SCTtoICD10":
	            consulta="SELECT D1.code as CSCT, D1.description as DSCT, D2.code as C10, D2.description as D10, C.map_Advice as mapAdvice FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'SCT' and D1.description LIKE '%" + q.name + "%' and D2.conv LIKE 'ICD10CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "SCTtoICD9":
	            consulta="SELECT D1.code as CSCT, D1.description as DSCT, D2.code as C9, D2.description as D9 FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'SCT' and D1.description LIKE '%" + q.name + "%' and D2.conv LIKE 'ICD9CM' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  			break;
	  		case "ICD9toSCT":
	            consulta="SELECT D1.code as C9, D1.description as D9, D2.code as CSCT, D2.description as DSCT FROM DESCRIPTION D1 JOIN DESCRIPTION D2 ON  D1.conv LIKE 'ICD9CM' and D1.description LIKE '%" + q.name + "%' and D2.conv LIKE 'SCT' JOIN CONVERSION C ON C.inicial=D1.code and C.conv_i=D1.conv and C.final=D2.code and C.conv_f=D2.conv ORDER BY D1.conv, D1.code, D2.conv, D2.code";
	  		  	break;


		}


	con.connect(function(err) {
	  con.query(consulta, function (err, result) {
	    if (err) throw "NO CONNECTION TO DATABASE";i
	    //console.log(result);
	    //console.log(consulta);
	    txt="";


		
		if(result.length==0){
			txt = '<br> No results';

		} else {
			for(var i=0; i<result.length;i++){
				switch(q.conversion) {
					case "ICD10toICD9":
						txt += '<tr><td style="border:1px solid #ddd; padding-left:5px;">'+ result[i].C10+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].D10+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C9 +'</td><td style="border:1px solid #ddd; padding:8px;padding-left:5px;">' +  result[i].D9 +'</td></tr>' ;
						break;
					case "ICD9toICD10":
						txt+='<tr><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].D9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C10 +'</td><td style="border:1px solid #ddd;padding-left:5px;">' +  result[i].D10 +'</td></tr>';
						break;
					case "SCTtoICD10":
						txt += '<tr><td style="border:1px solid #ddd;padding-left:5px;">' + result[i].CSCT+ '</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].DSCT+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].C10 + '</td><td style="border:1px solid #ddd;padding-left:5px;">'+  result[i].D10+ '</td><td style="border:1px solid #ddd;padding-left:5px;padding-left:5px;">'+ result[i].mapAdvice+'</td></tr>';
						break;
					case "SCTtoICD9":
						txt += '<tr><td style="border:1px solid #ddd;padding-left:5px;">' + result[i].CSCT+ '</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].DSCT+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].C9 + '</td><td style="border:1px solid #ddd;padding-left:5px;">'+  result[i].D9+'</td></tr>';
						break;
					case "ICD9toSCT":
						txt += '<tr><td style="border:1px solid #ddd;padding-left:5px;">'+ result[i].C9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].D9+'</td><td style="border:1px solid #ddd;padding-left:5px;">'+result[i].CSCT + '</td><td style="border:1px solid #ddd;padding-left:5px;">'+  result[i].DSCT+'</td></tr>';
						break;
				}	
			}

			switch(q.conversion) {
						case "ICD10toICD9":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD10</th><th style="text-align: center;border: 1px solid #ddd;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;">Description</th><th style="text-align: center;border: 1px solid #ddd;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;">ICD9</th><th style="text-align: center;border: 1px solid #ddd;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color:white;">Description</th></tr>'+txt+'</table>';
							break;
						case "ICD9toICD10":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD9</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD10</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th></tr>'+txt+'</table>';
							break;
						case "SCTtoICD10":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">SCT</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD10</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Advice</th></tr>'+txt+'</table>';
							break;
						case "SCTtoICD9":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">SCT</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD9</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th></tr>'+txt+'</table>';
							break;
						case "ICD9toSCT":
							txt='<br><meta charset="UTF-8"><table style="border-collapse:collapse; width: 100%;"><tr><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">ICD9</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">SCT</th><th style="border: 1px solid #ddd; padding: 8px;padding-top:12px;padding-bottom:12px;background-color:#0086b3;color: white;text-align: center;">Description</th></tr>'+txt+'</table>';
							break;
			}
		}

			
		res.end(txt);
		});


	});
});


server.listen(9999, function () {
    console.log('Example app listening on port 9999.');
});


