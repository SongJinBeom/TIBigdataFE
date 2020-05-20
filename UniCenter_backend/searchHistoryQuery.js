const express = require('express');
const router = express.Router();
// const User = require('./models/user');
// const gUser = require('./models/gUser');
// const User = require('./models/user');
const hst = require('./models/history');
const Res = require('./models/Res');
//for future. user model.
const userModel = {
    name: String,
    email: String,
    history: []
};



/**
 * @CommonFunctions
 * 
 * 
 * 
 */

//yet useless dir
router.get('/', (req, res) => {
    res.send('From API route')
})

/***
 * @SearchHistoryFunctions
 * 
 * 
 */
router.post('/addHistory', (req, res) => { //post로 바꿔주었음 20.05.13 16:24 바꾸고 server.js새로 켜줘야함
    // console.log("add history init");
    let bundle = req.body;
    // console.log(bundle);

    let time = new Date();

    let keyword = {
        keyword: bundle.key,
        year: time.getFullYear(),
        month: time.getMonth(),
        date: time.getDate(),
        hour: time.getHours(),
        min: time.getMinutes()
    };

    //add total search history from all users
    //new history keyword that is goona be added soon.
    newHst = new hst(keyword);
    newHst.save((err, keyword) => {
        if (err) {
            console.log("add history fail. error : " + err);
        }
        else {
            console.log("add total history ok")
        }
    });


    var userHst;
    var anyUser;
    //record user own history for each user
    var isLogin = bundle.login;
    if (isLogin) {
        /**
         * //enumerate login status
            enum logStat {
                unsigned,//0
                SUPERUSER,//1
                email,//2
                google,//3
            }
         */
        //2 : email, 3 : google
        if (isLogin >= 2) {
            anyUser = User;
        }
        // else {//email or super user
        //     anyUser = User;
        // }

        let userData = bundle.user;
        anyUser.findOneAndUpdate({ email: userData.email }, { $push: { history: keyword } }, (err, doc) => {
            if (err) {
                console.log("user personal history add failed!", err);
            }
            else {
                if (!doc) {
                    console.log("doc not found")
                    // console.log(doc);
                    res.status(401).send({ add: false });
                }
                else {
                    console.log("doc found!")
                    console.log(doc);
                    userHst = doc.history;
                    userHst.push(keyword);
                    console.log(userHst);
                    res.json({ history: userHst });
                }
            }

        });
    }

    console.log("add history done");
})

router.get('/showHistory', (req, res) => {
    console.log("add history init");
    let userData = req.body;
    User.findOne({ email: userData.email }, (err, doc) => {
        if (err) {
            console.log(err);
        }
        else {
            if (!doc) {
                // console.log("api gchecker : post false")
                console.log(doc);
                res.json({ result: false });
            }
            else {
                // console.log("api gchecker : post true")
                console.log(doc);

                res.json({ history: doc.history });
            }
        }

    });
})

router.get('/getHistoryCount', (req, res) => {
    hst.count(null, (err, count) => {
        if (err) {
            console.log("get history count error");
            res.status(401);
        }
        else
            res.json({ count: count });
    })
})


//Strongly recommand to use post function since it can control the history data in BacnEnd Side.
/**
 * post("/getTotalHistory",{idx : number, num : number});
 * @param idx : start index of history among total history
 * @param num : how many history data you request to backend server.
 */
router.post('/getTotalHistory', (req, res) => {

    var payload = req.body;
    var idx = payload.idx;
    var n = payload.num;

    // console.log("get total history func init");

    // var query = 
    hst.find({})
        .skip(idx)
        .limit(n)
        .exec(
            (err, hstrs) => {
                if (err)
                    console.log("post : get total history err")
                // console.log(hstrs);
                console.log("post total history ok")
                res.send({ histories: hstrs })
            });
});

router.get('/getTotalHistory', (req, res) => {
    // var result = hst.find({});
    // console.log(result);
    var hstResult = hst.find({})
        .limit(30)
    // console.log(hstResult);
    hstResult.exec(
        (err, hstrs) => {
            if (err)
                console.log("post : get total history err")
            console.log(hstrs);
            res.send({ histories: hstrs })
        }

    )

});

//debug
// countByMonth()

router.get('/getMonthFreqHistory', async (req, res) => {
    let s_t = Date.now()
    result = await countByMonth();
    let e_t = Date.now()
    console.log(e_t, s_t);
    let elapse_t = (e_t - s_t) / 1000;
    var tmp_t;
    var sec_t = Math.floor(elapse_t % 60);
    tmp_t = elapse_t / 60;
    var min_t = Math.floor(tmp_t % 60);
    tmp_t = tmp_t / 60;
    var hour_t = Math.floor(tmp_t % 60);
    console.log("total time taken : ", hour_t, "hour ", min_t, " min ", sec_t, " sec");
    console.log("month func load fin")
    console.log(result)
    res.status(200).json(result);
});

async function countByMonth() {
    /**
     * each month
     * each time
     * 
     * found if people search specific words.
     * 
     * top 3 keywords by each month.
     * get each month data
     * for each month, distinct keywords. 
     * then, count each keywords.
     * then, store the info somewhere.
     * then sort by frequency.
     * then get top X frequent keywords.
     */
    return new Promise((r) => {//
        hst.distinct("month").exec(async (err, mth) => {//
            let keyInMth = [];
            let idx = 0;
            let numMonth = mth.length;
            for (var i = 0; i < mth.length; i++) {
                var m = hst.find({ month: mth[i] });

                let numKey = m.length;
                let result = await countByFreq(numKey, 3, m);
                console.log("\n\n----------debugging : ");
                console.log(result);
                console.log("----------\n\n")
                keyInMth.push([mth[i], result]);
                idx++;//use asyncronous for performance

                // console.log("\n----------", mth[i], "th month result : ");
                // console.log(result);
                // console.log("----------\n")
            }
            if (idx >= numMonth) {
                //total taken time evaluate

                r(keyInMth);

            }
            // return keyInMth;
        })
    })//
}

//aggMonth deggung
// aggMonth()
function aggMonth() {
    hst.aggregate(
        
        [
            {
                // "$match" : {},
                "$group": {
                    _id: "$month",
                    // count: { "$sum": 1 },
                    key : {$push :{ k : "$keyword"}}
                }
            },
            {
                "$group" : {
                    _id : "$(_id.key.k)",
                    count : {"$sum" : 1}

                }
            },
            {
                "$sort": { count: -1 }
            },
            {
                "$limit": 10
            }
        ]
        

    , (err, res) => {
        console.log("work...")
        // res.forEach((err,doc)=>{
        //     console.log(doc);
        // })
        console.log(res);
    })
}


router.get('/getSortFreqHistory', async (req, res) => {
    var r = await countByFreq();
    res.status(200).json(r);
});


//debug
//run node server.js
// sortAndCountFreq();

//sort search history data
//LIM : number of distinct and unique keywords stored and get counted freq.
async function countByFreq(LIM = 1500, topX = 50, pipe_collection = hst) {

    // let LIM = 1500;
    // let topX = 20;
    return new Promise((resolve) => {

        pipe_collection.distinct("keyword", (err, key) => {
            console.log(key.length, "unique words");
            var keyFreq = [];
            //top topX frequent keyword container
            var topKey = [];
            //find the top topX frequent
            new Promise((resolve) => {


                for (var i = 0; i < LIM; i++) {
                    //asyncronous
                    let k = key[i];//must be let. let use independent object var.
                    // useful for asyncronous method.
                    let idx = i;
                    hst.countDocuments({ keyword: k })
                        .exec((err, count) => {
                            // console.log(k, " : ");
                            // console.log(count);
                            keyFreq.push([k, count]);

                            //must guarantee all keywords freq is stored fin.
                            if (idx >= LIM - 1) {
                                resolve()
                            }
                        })
                }//for
            }).then(() => {
                console.log("sort?")
                for (var i = 0; i < LIM; i++) {
                    // console.log(keyFreq[i])
                    if (i > LIM) break;//handle among only LIM number of documents.
                }//for
                let s = Date.now()
                keyFreq = keyFreq.sort((a, b) => b[1] - a[1]);
                let e = Date.now()
                let elapse = (e - s) / 1000;
                var tmp;
                var sec = Math.floor(elapse % 60);
                tmp = elapse / 60;
                var min = Math.floor(tmp % 60);
                tmp = tmp / 60;
                var hour = Math.floor(tmp % 60);
                console.log("sort!")
                console.log("time taken : ", hour, "hour ", min, " min ", sec, " sec");
                for (var i = 0; i < LIM; i++) {
                    // console.log(keyFreq[i])
                    if (i > LIM) break;
                }//for

                for (var i = 0; i < topX; i++) {
                    topKey.push(keyFreq[i]);
                }
                console.log("top key ", topX)
                console.log(topKey);


                resolve(topKey);
            })//then
        })//distinct

    })
}


//use aggregate functino
//debug
// aggregate();

async function aggregate() {
    //unique words
    //top freq 5?
    //unique, frequency, top5
    let s = Date.now()

    const agg = hst.aggregate(
        [
            {
                "$group": {
                    _id: "$keyword"
                    , count: { "$sum": 1 }
                }
            },
            {
                "$sort": { count: -1 }
            },
            {
                "$limit": 50
            }
        ]
    )
    agg.exec((err, result) => {
        // console.log(result);
        let e = Date.now()
        let elapse = (e - s) / 1000;
        var tmp;
        var sec = Math.floor(elapse % 60);
        tmp = elapse / 60;
        var min = Math.floor(tmp % 60);
        tmp = tmp / 60;
        var hour = Math.floor(tmp % 60);
        console.log("sort!")
        console.log("time taken : ", hour, "hour ", min, " min ", sec, " sec");
        return result;
    })
}



const User = require('./models/user');






// 상원이가 해두고 감. 어떤 용도인지 잘 모르겠음...
// router.get('/events', verifyToken, (req, res) => {
//     let events = [{
//             "_id": "1",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "2",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "3",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "4",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "5",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "6",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         }
//     ]

//     res.json(events)
// })

// router.get('/special', (req, res) => {
//     let events = [{
//             "_id": "1",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "2",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "3",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "4",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "5",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         },
//         {
//             "_id": "6",
//             "name": "Auto Expo",
//             "description": "lorem ipsum",
//             "date": "2012-04-23T18:25:43.511Z"
//         }
//     ]

//     res.json(events)
// })





module.exports = router;