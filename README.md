# Major Project - Faculty App

----
### Getting Started
1. ```git clone https://github.com/whitetig3r/major-project-faculty-app.git```  while in a Terminal on macOS or Linux *(OR)* [git bash](https://gitforwindows.org/) on Windows.
2. `cd major-project-faculty-app` and run `yarn install` or `npm install` to install all dependencies. (depending on the package manager you use).
3. While in the project root directory, run the development server script using `npm run dev`.
4. Go to [localhost:3000](http://localhost:3000) and you will see the app entry point.
5. Authentication with Firebase Auth using Google as provider has been implemented and by default is set to only accept *srmuniv.edu.in* domain e-mail ids. Change to the specific domain name, for production.
6. Since all data is fetched dynamically from Firebase Firestore, an account is required. Fill in the credentials in /lib/db.js .

##### NOTE:
 To use the ChirpSDK, ensure that you have signed up at [chirp.io](https://chirp.io/) and have added a valid application origin. 
