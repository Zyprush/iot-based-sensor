import firebase from "firebase/compat";
const firebaseConfig = {
    apiKey: "AIzaSyAtPxsO2jxjPEcIh7yY3KEw2DH7WAVCq_0",
    authDomain: "tilapia-auth.firebaseapp.com",
    projectId: "tilapia-auth",
    storageBucket: "tilapia-auth.appspot.com",
    messagingSenderId: "432788402999",
    appId: "1:432788402999:web:7e63b5cf02310e6a6fe0b2"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()

export { auth };