import { db } from './firebaseConfig.js';
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const form = document.getElementById('askcmu-chat-form');
const input = document.getElementById('askcmu-user-input');
const chatWindow = document.getElementById('askcmu-chat-window');

const userName = localStorage.getItem("userName") || "Student";
let isChatDeleted = false; // ✅ Track if chat was deleted

// ✅ Load past conversation from Firestore
async function loadConversation() {
  try {
    const docRef = doc(db, "chatlogs", userName);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      isChatDeleted = true; // ✅ Mark as deleted
      addMessage('askcmu-bot', "⚠️ Your conversation has been deleted by an admin.");
      return;
    }

    const data = snapshot.data();
    const exchanges = Array.isArray(data.exchanges) ? data.exchanges : [];

    if (exchanges.length === 0) {
      addMessage('askcmu-bot', "⚠️ No previous messages found.");
      return;
    }

    exchanges.forEach(entry => {
      if (entry.userMessage && typeof entry.userMessage === 'string') {
        addMessage('askcmu-user', entry.userMessage);
      }
      if (entry.botResponse && typeof entry.botResponse === 'string') {
        addMessage('askcmu-bot', entry.botResponse);
      }
    });
  } catch (err) {
    console.error("Failed to load conversation:", err);
    addMessage('askcmu-bot', "⚠️ Couldn't load past messages.");
  }
}

// ✅ Greet and load history when chatbot loads
window.addEventListener("DOMContentLoaded", () => {
  addMessage('askcmu-bot', `Hi ${userName}, ask me anything about enrollment.`);
  loadConversation();
});

// ✅ Handle new message submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (!query) return;

  addMessage('askcmu-user', query);
  input.value = '';

  try {
    const res = await fetch('/php/chatbot.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `query=${encodeURIComponent(query)}&userName=${encodeURIComponent(userName)}`
    });

    const rawText = await res.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.warn("⚠️ Invalid JSON from chatbot.php:", rawText);
      addMessage('askcmu-bot', "⚠️ Bot response was unreadable. Try again.");
      return;
    }

    if (data.response && typeof data.response === 'string') {
      addMessage('askcmu-bot', data.response);

      // ✅ Log to Firestore: one document per user
      try {
        const docRef = doc(db, "chatlogs", userName);
        const existing = await getDoc(docRef);

        const newEntry = {
          timestamp: new Date().toISOString(),
          userMessage: query,
          botResponse: data.response
        };

        let updatedLog = [];

        if (!isChatDeleted && existing.exists()) {
          const oldData = existing.data();
          updatedLog = Array.isArray(oldData.exchanges)
            ? [...oldData.exchanges, newEntry]
            : [newEntry];
        } else {
          updatedLog = [newEntry]; // ✅ Start fresh if deleted
        }

        await setDoc(docRef, {
          userId: userName,
          exchanges: updatedLog
        });

        isChatDeleted = false; // ✅ Reset flag after new message
      } catch (err) {
        console.error("Failed to log to Firestore:", err);
      }

    } else {
      console.warn("⚠️ Unexpected response structure:", data);
      addMessage('askcmu-bot', "⚠️ Unexpected bot reply format.");
    }
  } catch (err) {
    console.error("Failed to fetch chatbot response:", err);
    addMessage('askcmu-bot', "⚠️ Something went wrong. Please try again.");
  }
});

// ✅ Render message in chat window
function addMessage(senderClass, text) {
  if (!text || typeof text !== 'string') return;

  const msg = document.createElement('div');
  msg.className = `askcmu-message ${senderClass}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
