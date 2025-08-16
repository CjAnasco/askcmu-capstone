// js/signup.js
import { auth, db } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const gender = document.getElementById("gender").value;
  const birthdate = document.getElementById("birthdate").value;
  const contact = document.getElementById("contact").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      firstName,
      lastName,
      email,
      gender,
      birthdate,
      contact,
      createdAt: new Date()
    });
  
    // ✅ Store firstName for chatbot personalization
    localStorage.setItem("userName", firstName);

    alert("Account created successfully!");
    window.location.href = "login.html";
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
});
