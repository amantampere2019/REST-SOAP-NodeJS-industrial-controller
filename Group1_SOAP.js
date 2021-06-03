/*modules used in the program*/
var http = require('http')
var express = require('express')
var app = express()
var bodyParser = require('body-parser') /*middleware for express module*/
var request = require('request');


/*declared global variables*/
var outString = '';
var stateBoolOut=[];
var timeStOut;
var count =1;
var countOut;


/*every request will pass trough bodyParser module*/
app.use(bodyParser.json())
/*showing output, time and number of events in web browser*/
app.get('/', function(req, res){
    res.send('<p>Status of the outputs   :   '+ stateBoolOut +'<br>'+'Current time in the S1000 RTU   :   ' + timeStOut +'<br>'+  'Showing the number of received events   :   '+ countOut+'</p> ');
})
app.post('/', function (req, res) {
    countOut=timeSta(req.body.payload.timeStamp) /*parsing timestamp from the body and calling timeSta function to get the seconds*/
    console.log(req.body.payload.timeStamp)
    res.send('POST request to homepage');
});
/*web server*/
app.listen(3000,function(){
    console.log("Server is running...")})


/*sending request to subscribe event*/
var timeNotifs = {
    url: 'http://192.168.100.101/rest/events/time/notifs',
    headers: {
        'User-Agent': 'request',
        'content-type': 'application/json'
    },
    body:'{"destUrl":"http//:192.168.100.102:3000"}'
};
request.post(timeNotifs, function (error, response, body) {
    console.log(body) 
})


/*requesting inico S1000 to send timestamps*/
var startEvents = {
    url: 'http://192.168.100.101/rest/services/startEvents',
    headers: {
        'User-Agent': 'request',
        'content-type': 'application/json'
    },
    body:'{"destUrl":"http//:192.168.100.102:3000"}'
};
request.post(startEvents, function (error, response, body) {
    console.log(body)
})


/*getting seconds from timestamp  as well as  send a request to the s1000 to change the outputs*/
function timeSta(timeStamp) {
    var timeSt = new Date(timeStamp) /*declaring timeSt as a date*/
    timeStOut = timeSt
    var secondSt = timeSt.getSeconds() /*getting seconds from timeStamp*/
    var d2b = secondSt.toString(2) /*converting seconds from desimal to binary*/
    console.log(d2b)
    /*declaring all output false before reading them*/
    var stateBool = [0, 0, 0, 0, 0, 0, 0, 0]
    for (var i = 0; i < 8; i++) {
        stateBool[i] = Boolean(Number(d2b[i])) /*converting string to number format and converting that to boolean variable*/
    }
    console.log(stateBool)
    stateBoolOut=stateBool

     /*soap message body to be sent to inico module for changing outputs*/    
    bodyToSend ='<?xml version="1.0" encoding="ISO-8859-1"?>'+
        '<s12:Envelope xmlns:s12="http://www.w3.org/2003/05/soap-envelope"xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing">'+
        '<s12:Header><wsa:Action>http://www.tut.fi/fast/Assignment/UpdateOutputs_Request</wsa:Action></s12:Header>'+
        '<s12:Body><Outputs xmlns="http://www.tut.fi/fast/Assignment"><output0 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[0]+'</output0><output1 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[1]+'</output1><output2 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[2]+'</output2><output3 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[3]+'</output3><output4 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[4]+'</output4><output5 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[5]+'</output5><output6 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[6]+'</output6><output7 xmlns="http://www.tut.fi/fast/Assignment">'+stateBool[7]+'</output7></Outputs></s12:Body>'+
        '</s12:Envelope>',

        outString = bodyToSend;
  
    /*message to be sent to inico module*/
    var changeOutput = {
        url: 'http://192.168.100.101:80/dpws/WS01',
        headers: {
            'User-Agent': 'request',
            'content-type': 'application/xml'
        },
        body: outString
    }
   
    request.post(changeOutput, function (error, response, body) {
    })
    return count++; /*for counting events*/
}

