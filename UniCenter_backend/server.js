
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const path = require('path');

const app = express();
const mongoose = require('mongoose'); //mongose 서버와 백엔드 연결 


const PORT = 4000;

const db = 'mongodb://localhost:27017/user';


mongoose.connect(db, err => {
    if (err) {
        console.error('Error!' + err)
    } else {
        console.log('Connected to mongodb');
    }
});

const hstQry = require('./searchHistoryQuery');//bring the backend func and feature
const gUserQry = require('./googleUserQuery');
const eUserQry = require('./emailUserQuery');
const keepDoc = require('./keepMyDocQuery');
app.use(cors());
app.use(bodyParser.json());
app.use('/hst', hstQry);//hst 경로에서 항상 require("./hst") 호출한다. use : middleware 함수.
app.use('/gUser',gUserQry);
app.use('/eUser',eUserQry);
app.use('/myDoc',keepDoc);

//root dir
app.get('/', function(req, res) {
    res.send('Hello from server');
})

//server listen with no time interval?
app.listen(PORT, function(){
    console.log('Express server running on port '+ PORT)});


