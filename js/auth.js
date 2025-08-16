import { auth, db } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault(); // Prevent page refresh

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // ✅ Get reCAPTCHA token
  const captchaResponse = grecaptcha.getResponse();
  if (!captchaResponse) {
    alert("Please complete the CAPTCHA.");
    return;
  }

  try {
    // ✅ Send CAPTCHA token to backend for verification
    const captchaCheck = await fetch("/php/verify-captcha.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `g-recaptcha-response=${encodeURIComponent(captchaResponse)}`
    });

    const result = await captchaCheck.json();
    if (!result.success) {
      alert("CAPTCHA verification failed.");
      return;
    }

    // ✅ Proceed with Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const firstName = userDoc.data().firstName;
      localStorage.setItem("userName", firstName);
    } else {
      console.warn("User document not found in Firestore.");
      localStorage.setItem("userName", "Student");
    }

    alert("Login successful!");
    window.location.href = "chatbot.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
