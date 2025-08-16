// js/logout.js
import { auth } from "./firebaseConfig.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

signOut(auth).then(() => {
  window.location.href = "login.html";
}).catch(error => {
  alert("Logout failed: " + error.message);
});
