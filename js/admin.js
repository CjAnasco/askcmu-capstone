import { db } from "./firebaseConfig.js";
import { collection, getDocs, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const faqForm = document.getElementById("faqForm");
const faqList = document.getElementById("faqList");

async function ensureSampleFaqs() {
  const faqsCol = collection(db, "faqs");
  const faqSnapshot = await getDocs(faqsCol);
  if (faqSnapshot.empty) {
    // Enrollment intent
    await setDoc(doc(db, "faqs", "enrollment"), {
      keywords: ["enroll", "registration", "start", "classes", "date"],
      responses: [
        "Enrollment starts on August 15. You can register online or visit the registrar's office.",
        "You can enroll starting August 15! Would you like to know the requirements?",
        "Enrollment opens August 15. Need help with the process?"
      ],
      followup: "Would you like to know the requirements or the steps to enroll?",
      confirm: "Yes, August 15 is the verified enrollment start date from the registrar."
    });
    // Requirements intent
    await setDoc(doc(db, "faqs", "requirements"), {
      keywords: ["documents", "papers", "requirements", "bring", "needed", "need"],
      responses: [
        "You need a valid ID, transcript, and registration form to enroll.",
        "Bring your ID, transcript, and registration form for enrollment.",
        "The requirements are a valid ID, transcript, and registration form."
      ],
      followup: "Do you want details about where to submit these documents?",
      confirm: "Yes, those are the official requirements listed by CMU."
    });
    // Tuition intent
    await setDoc(doc(db, "faqs", "tuition"), {
      keywords: ["tuition", "fee", "fees", "cost", "payment", "how much", "price"],
      responses: [
        "Tuition fees vary by program. Visit the CMU website or contact the finance office for details.",
        "The tuition depends on your program. Would you like a link to the fee schedule?",
        "Tuition information is available from the finance office."
      ],
      followup: "Would you like to know how to pay your tuition?",
      confirm: "Yes, tuition details are available from the finance office."
    });
    // Greetings intent
    await setDoc(doc(db, "faqs", "greetings"), {
      keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
      responses: [
        "Hello! How can I help you today?",
        "Hi there! What would you like to know about CMU?",
        "Hey! Ask me anything about enrollment or requirements."
      ],
      followup: "Is there something specific you want to ask about?"
    });
    // Thanks intent
    await setDoc(doc(db, "faqs", "thanks"), {
      keywords: ["thanks", "thank you", "appreciate", "grateful"],
      responses: [
        "You're welcome! If you have more questions, just ask.",
        "Glad I could help! Anything else you want to know?",
        "No problem! Let me know if you need more information."
      ]
    });
    // Goodbye intent
    await setDoc(doc(db, "faqs", "goodbye"), {
      keywords: ["bye", "goodbye", "see you", "farewell", "later"],
      responses: [
        "Goodbye! Have a great day.",
        "See you next time! If you have more questions, just return.",
        "Farewell! I'm here whenever you need help."
      ]
    });
  }
}

async function loadFaqs() {
  faqList.innerHTML = "";
  const faqsCol = collection(db, "faqs");
  const faqSnapshot = await getDocs(faqsCol);
  faqSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    // Show all responses if array, else show response
    let resp = Array.isArray(data.responses) ? data.responses.join(" / ") : data.response;
    const li = document.createElement("li");
    li.textContent = `${docSnap.id}: ${resp}`;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "faqs", docSnap.id));
      loadFaqs();
    };
    li.appendChild(delBtn);
    faqList.appendChild(li);
  });
}

faqForm.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById("faqId").value.trim();
  const keywords = document.getElementById("keywords").value.split(",").map(k => k.trim());
  const response = document.getElementById("response").value.trim();
  const confirm = document.getElementById("confirm").value.trim();
  await setDoc(doc(db, "faqs", id), { keywords, response, confirm });
  faqForm.reset();
  loadFaqs();
};

// Ensure sample FAQs exist, then load all FAQs
ensureSampleFaqs().then(loadFaqs);