const express = require('express')
const next = require('next')
const bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const admin = require("firebase-admin");
const FIREBASE_DB = require("./lib/firebase_db_URL");
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const https = require('https');
const querystring = require('querystring');
const firebase = admin.initializeApp(
    {
        credential: admin.credential.cert(require('./lib/firebase_server')),
        databaseURL: FIREBASE_DB.URL
    },
    'server'
)
const typingDNA = require('./lib/typingDNA_config').typingDNA; 


app.prepare()
    .then(() => {
        const server = express()

        server.use(bodyParser.json())
        server.use(
            session({
                secret: 'YOUR_SECRET',
                saveUninitialized: true,
                store: new FileStore({ path: '/tmp/sessions', secret: 'YOUR_SECRET' }),
                resave: false,
                rolling: true,
                httpOnly: true,
                cookie: { maxAge: 604800000 } 
            })
        )

        server.use((req, res, next) => {
            req.firebaseServer = firebase
            next()
        })

        server.post('/api/login', (req, res) => {
            if (!req.body) return res.sendStatus(400)
    
            const token = req.body.token
            firebase
                .auth()
                .verifyIdToken(token)
                .then(decodedToken => {
                    req.session.decodedToken = decodedToken
                    return decodedToken
                })
                .then(decodedToken => res.json({ status: true, decodedToken}))
                .catch(error => res.json({ error }))
        })

        server.post('/api/logout', (req, res) => {
            req.session.decodedToken = null
            res.json({ status: true })
        })

        server.get('/attendance/:courseString', (req, res) => {
            const actualPage = '/attendance'
            const queryParams = { courseString: req.params.courseString }
            app.render(req, res, actualPage, queryParams)
        })

        server.get('/attendEvent/:attendString', (req, res) => {
            const actualPage = '/attendEvent'
            const queryParams = { attendString: req.params.attendString }
            app.render(req, res, actualPage, queryParams)
        })
        
        server.post('/attendeeVerify', (request, response) => {
        
            const apiKey = typingDNA.apiKey;
            const apiSecret = typingDNA.apiSecret;
            const base_url = 'api.typingdna.com';

            const data = {
                tp1 : request.body.tp1,
                tp2 : request.body.tp2,
                quality : 2,
            }

            console.log(data);

            const options = {
                hostname : base_url,
                port : 443,
                path : '/match',
                method : 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cache-Control': 'no-cache',
                    'Authorization': 'Basic ' + new Buffer(apiKey + ':' + apiSecret).toString('base64'),
                },
                };

            var responseData = '';  //HAS TO BE VAR !IMP

            const req = https.request(options, function(res) {
                res.on('data', function(chunk) {
                    responseData += chunk;
                });

                res.on('end', function() {
                    //console.log(JSON.parse(responseData));
                    response.json(JSON.parse(responseData)); //sending the response back
                });
            });

        req.on('error', function(e) {
            console.error(e);
        });
        req.write(
            querystring.stringify(data)
        );
        req.end();

        
     
        })

        server.get('*', (req, res) => {
            return handle(req, res)
        })

        server.listen(3000, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3000')
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })
