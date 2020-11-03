//------------------ GLOBALS -------------------//
//Firebase configuration json
var firebaseConfig = {
    apiKey: "AIzaSyCQhmw85lCcRf8YBCYifYxndXLvZ2JN7O0",
    authDomain: "quiztb-176c8.firebaseapp.com",
    databaseURL: "https://quiztb-176c8.firebaseio.com",
    projectId: "quiztb-176c8",
    storageBucket: "quiztb-176c8.appspot.com",
    messagingSenderId: "392590006895",
    appId: "1:392590006895:web:42b85c76d078a11cd88b9a"
};

//------------------ MODULES -------------------//
const firebase      = require('firebase');
const express       = require('express');
const bodyParser    = require('body-parser');
const corsEnable    = require('cors');


//Firebase initialization
firebase.initializeApp(firebaseConfig);

//Creation of Express server
const serverObj = express();

//Express server setup
//Definition of listening port
const listeningPort = 8888;
//Setup the public (Frontend) folder
const publicFiles   = express.static('public');
serverObj.use(publicFiles);
//Setup body parser for json use
serverObj.use(bodyParser.urlencoded({extended : false}));
serverObj.use(bodyParser.json());
serverObj.use(corsEnable());

//Raise Express server
serverObj.listen(listeningPort, () => console.log(`Server started listening on ${listeningPort}`));

const getRequest = (node) => {
    const prom = new Promise((resolve, reject) => {
        firebase.database().ref(node).on("value", (snapshot) => {
            resolve(snapshot.val());
        });
    });
    return prom;
}//getRequest

//------------------ ROUTING -------------------//
//RETRIVE QUIZ TITLE (GET)
serverObj.get('/title', (req, res) => {
    getRequest('/title').then((firebaseRes) => {
        res.send(firebaseRes);
    });
});

//RETRIVE QUIZ QUESTIONS (GET)
serverObj.get('/questions', (req, res) => {
    getRequest('/questions').then((firebaseRes) => {
        res.send(firebaseRes);
    });
});

//CREDENTIALS CHECKOUT (POST)
serverObj.post('/login', (req, res) => {
    //Get user from db
    const prom = new Promise((resolve, reject) => {
        firebase.database().ref('/user').on("value", (snapshot) => {
            resolve(snapshot.val());
        });
    })
    prom.then((firebaseRes) => {
        if (firebaseRes === req.body.user)
        {
            console.log(`${firebaseRes}; ${req.body.user}`);
            //User email matches
            //Now check out the password
            const prom = new Promise((resolve, reject) => {
                firebase.database().ref('/pass').on("value", (snapshot) => {
                    resolve(snapshot.val());
                });
            })
            prom.then((firebaseRes) => {
                if (firebaseRes === req.body.pass)
                {
                    console.log(`${firebaseRes}; ${req.body.pass}`);
                    //Password matches
                    res.send('1');
                }//if
                else
                {
                    res.send('0');
                }//else
            });
        }//if
        else
        {
            res.send('0');
        }//else*/
    });
});

//RETRIVE NUMBER OF QUESTIONS (GET)
serverObj.get('/questionsCount', (req, res) => {
    getRequest('/questionsCount').then((firebaseRes) => {
        res.send(JSON.stringify(firebaseRes));
    });
});

//INSERT NEW QUESTION (POST)
serverObj.post('/newQuestion', (req, res) => {
    const prom = new Promise((resolve, reject) => {
        //console.log(req.body.data);
        //console.log(req.body.questionsCount);
        firebase.database().ref("questions").update(req.body.data);
        firebase.database().ref("questionsCount").set(req.body.questionsCount);
        resolve('ok');
        });
        prom.then((ret) => res.send(ret));
    });