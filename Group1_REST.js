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

     /*REST message body to be sent to inico module for changing outputs*/
    bodyToSend ="{" + '"state0"' + ":" + stateBool[0] + "," + '"state1"' + ":" + stateBool[1] + "," + '"state2"' + ":" + stateBool[2] + "," + '"state3"' + ":" + stateBool[3] + "," + '"state4"' + ":" + stateBool[4] + ","
        + '"state5"' + ":" + stateBool[5] + "," + '"state6"' + ":" + stateBool[6] + "," + '"state7"' + ":" + stateBool[7] + "}"

        outString = bodyToSend;
  
    /*message to be sent to inico module*/
    var changeOutput = {
        url: 'http://192.168.100.101/rest/services/changeOutput',
        headers: {
            'User-Agent': 'request',
            'content-type': 'application/json'
        },
        body: outString
    }
   
    request.post(changeOutput, function (error, response, body) {
    })
    return count++; /*for counting events*/
}

