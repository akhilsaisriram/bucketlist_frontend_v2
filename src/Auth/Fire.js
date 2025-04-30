// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// import firebase from 'firebase';
// const auth =firebase.auth();

// const firebaseConfig = {

// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';



const firebaseConfig = {
     apiKey: "",
     authDomain: "b.com",
     projectId: "",
     storageBucket: "",
     messagingSenderId: "",
     appId: ""
   };
 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);
 const db = firebase.firestore();
 const auth = firebase.auth();
 export {auth,firebase};
 export default db;


 
