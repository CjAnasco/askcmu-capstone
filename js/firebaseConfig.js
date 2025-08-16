// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"; // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyDVLz93ZL1IFd-ppY-Moh48KKwbwLbAAC8",
  authDomain: "askcmu.firebaseapp.com",
  projectId: "askcmu",
  storageBucket: "askcmu.firebasestorage.app",
  messagingSenderId: "101293527877",
  appId: "1:101293527877:web:dd65c494eced05f040e42c",
  measurementId: "G-ZYMWPXXHZX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Initialize Firestore
const analytics = getAnalytics(app);

export { auth, db }; // ✅ Export both
