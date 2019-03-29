# Major Project - Next.js App

----
### Getting Started
1. ```git clone https://github.com/whitetig3r/chirpNext-event-app.git```  while in a Terminal on macOS or Linux *(OR)* [git bash](https://gitforwindows.org/) on Windows.
2. `cd chirpNext-event-app` and run `yarn install` or `npm install` to install all dependencies. (depending on the package manager you use).
3. While in the project root directory, run the development server script using `npm run dev`.
4. Go to [localhost:3000](http://localhost:3000) and you will see the app entry point.
5. Authentication with Firebase Auth using Google as provider has been implemented. Based on domain of the e-mail addesses, one will be able to create/attend events.
6. Since all data is fetched dynamically from Firebase Firestore, an account is required. Create a `/lib` directory and create the following files for various credentials:
    * `chirp_config.js` for `CHIRP_API_KEY` and `CHIRP_API_SECRET`.
    * `firebase_client.js` description of the file given at the end of this doc.
    * `firebase_server.js` your firebase service account creds should be exported from this file.
    * `firebase_db_URL.js` for just the firebase firestore DB url. (_can be placed in `firebase_client.js`_)
    * `typingDNA_config.js` for your typingDNA creds.

### Structure of firebase_client.js:

```
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import "firebase/auth";

export function loadFirebase() {
    try{
        const config = {
            apiKey: "########################",
            authDomain: "########################",
            databaseURL: "########################",
            projectId: "#####################",
            storageBucket: "#####################",
            messagingSenderId: "##################"
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
```

##### NOTE:
 To use the ChirpSDK, ensure that you have signed up at [chirp.io](https://chirp.io/) and have added a valid application origin. 
