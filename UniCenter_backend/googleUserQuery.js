const express = require('express');
const router = express.Router();
const User = require('./models/user');

//google token verify code template
const { OAuth2Client } = require('google-auth-library');

/**
 * @GoogleLoginFunctions
 *  
 * 
 */

function verifyGoogleToken(req, res) {
    var token = req.body.token;
    var CLIENT_ID = req.body.client;

    const client = new OAuth2Client(CLIENT_ID);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        // console.log("get ticket : ",ticket);
        const payload = ticket.getPayload();
        const userInfo = {
            name: payload.name,
            email: payload.email
        }
        // const userid = payload['sub'];
        // If request specified a G Suite domain:
        //const domain = payload['hd'];

        return res.status(200).send({ status: true, user: payload });
    }

    return verify().catch((err) => {
        console.error(err);
        console.log("error");
        return res.status(200).send({ status: false, err: err });
    })
}

router.post('/gRegister', (req, res) => {
    console.log("api : gRegister init.");
    let userData = req.body;
    userData.auth = "google";
    let user = new User(userData);
    user.save((error, registeredUser) => {
        if (error) {
            console.log("google social user register data save error : " + error);
            res.json({ succ: false })
        }
        else {
            console.log("api : gmail register : save ok");
            res.json({ succ: true, user : user.email });
        }
    })
})

router.post('/gCheckUser', (req, res) => {
    console.log("api : gChecker init.");
    let userData = req.body;
    User.findOne({ email: userData.email }, (error, user) => {
        if (error) {
            console.log("gCheckUSer error : " + error);
        }
        else {
            if (!user) {
                res.json({ exist: false });
            }
            else {
                res.json({ exist: true });
            }
        }
    })
})

router.post('/verifyGoogleToken', verifyGoogleToken);
module.exports = router;