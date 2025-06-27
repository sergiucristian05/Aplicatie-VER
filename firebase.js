// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCt88s-mR_FEbuAMa9tZQSGy3C9PGyxY4",
  authDomain: "flota-ver-app.firebaseapp.com",
  projectId: "flota-ver-app",
  storageBucket: "flota-ver-app.appspot.com",
  messagingSenderId: "571371386167",
  appId: "1:571371386167:web:6c6837d37839e3055b96b2"
};

// Inițializează Firebase
const app = initializeApp(firebaseConfig);

// Exportă Firestore
const db = getFirestore(app);

export { db };
