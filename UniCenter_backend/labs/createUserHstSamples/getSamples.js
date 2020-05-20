var spawn = require('child_process').spawn;
const pyDir = "../../../../TIBigdataMiddleware/Labs/sample user history"
var py = spawn('python', ['history.py'], { cwd: pyDir });
const fs = require('fs');

const hst = require('../../models/history');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

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

app.use(cors());
app.use(bodyParser.json());

//root dir
app.get('/', function (req, res) {
    res.send('Hello from server');
})

//server listen with no time interval?
app.listen(PORT, function () {
    console.log('Express server running on port ' + PORT)
});

py.stdout.on('data', (d) => {
    var rawdata = fs.readFileSync(pyDir + '/tokened_history.json');
    let data = JSON.parse(rawdata);
    console.log(data.length);
    var count = 0;
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            /**
             * Shema
                    {

                        keyword : String,
                        year : Number,//2019
                        month : Number,//1~12
                        date : Number,//1~31.1,3,5,7,8,10,12, 1~30, 4,6,9,11. 1~28 for 2.
                        hour : Number,0~23.
                        min : Number, 0~59.
                    }
             */

            var mth = Math.floor(Math.random() * 12) + 1;
            var hstData = {
                keyword: data[i][j],
                year: 2019,
                month: Math.floor(Math.random() * 12) + 1,
                date: mth == (1 || 3 || 5 || 7 || 8 || 10 || 12) ? Math.floor(Math.random() * 31) + 1 : (mth == (4 || 6 || 9 || 11) ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 28) + 1),
                hour: Math.floor(Math.random() * 24),
                min: Math.floor(Math.random() * 60)
            };
            newHst = new hst(hstData);
            newHst.save((err, h) => {
                if (err) {
                    console.log("add history fail. error : " + err);
                }
                else {
                    // count ++;
                    // console.log(count)
                    // console.log("add " + count + "th new history");
                }
            });
        }

    }
})


py.stdout.on("close", () => {
    console.log("done!");
})

