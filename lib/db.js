import * as firebase from 'firebase/app';
import 'firebase/firestore';

export function loadFirebase() {
    try{
        const config = {
      
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
