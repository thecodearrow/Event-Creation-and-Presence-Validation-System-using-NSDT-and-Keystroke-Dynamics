const express = require('express')
const next = require('next')
const bodyParser = require("body-parser");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const admin = require("firebase-admin");

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const firebase = admin.initializeApp(
    {
        credential: admin.credential.cert(require('./lib/firebase_server')),
        databaseURL: 'YOUR_DB_URL' 
    },
    'server'
)


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
