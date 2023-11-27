import firebase from "firebase/compat/app";
import "firebase/compat/database";
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCdJ3UUlxQ1w1zcqBIUWXrRcnaxWbjOODE",
  authDomain: "iot-based-sensor-data.firebaseapp.com",
  databaseURL: "https://iot-based-sensor-data-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-based-sensor-data",
  storageBucket: "iot-based-sensor-data.appspot.com",
  messagingSenderId: "966127105278",
  appId: "1:966127105278:web:8cfc7030f865c1136321af"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app()
}

const auth = firebase.auth()
const database = firebase.database()

export { auth, database };