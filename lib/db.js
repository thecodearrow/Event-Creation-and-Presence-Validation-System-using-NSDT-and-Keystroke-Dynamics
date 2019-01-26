import firebase from 'firebase/app';
import 'firebase/firestore';

export function loadFirebase() {
    try{
        const config = {
            apiKey: process.env.FB_APIKEY,
            authDomain: process.env.FB_AUTHDOMAIN,
            // databaseURL: process.env.FB_DB_URL,
            projectId: process.env.FB_PROJECTID,
            // storageBucket: process.env.FB_STORAGEBUCKET,
            // messagingSenderId: process.env.FB_MESSAGINGSENDERID
        };
        firebase.initializeApp(config);
    }
    catch(err){
        if (!/already exists/.test(err.message)) {
            console.error('Firebase initialization error', err.stack);
        }
    }
    return firebase;
}
