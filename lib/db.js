import * as firebase from 'firebase/app';
import 'firebase/firestore';

export function loadFirebase() {
    try{
        const config = {
            apiKey: "AIzaSyANrjtj3qukp6kD6nLo7VLB4tmzx7-sgsY",
            authDomain: "majorproject-soundshinobi.firebaseapp.com",
            databaseURL: "https://majorproject-soundshinobi.firebaseio.com",
            projectId: "majorproject-soundshinobi",
            storageBucket: "majorproject-soundshinobi.appspot.com",
            messagingSenderId: "59380949899"
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
