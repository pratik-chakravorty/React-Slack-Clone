import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  //add your firebase config here
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
