import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  apiKey: "AIzaSyDBaTJ6K6A5cikliN_KUQPajbylrapjv0w",
  authDomain: "react-slack-clone-2707d.firebaseapp.com",
  databaseURL: "https://react-slack-clone-2707d.firebaseio.com",
  projectId: "react-slack-clone-2707d",
  storageBucket: "react-slack-clone-2707d.appspot.com",
  messagingSenderId: "179541173604",
  appId: "1:179541173604:web:9de63b37ef7c4ae063c671",
  measurementId: "G-89XVVWR61W"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
