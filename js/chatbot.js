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

// ✅ Load past conversation
async function loadConversation() {
  try {
    const res = await fetch(`/php/load-chat.php?user_id=${encodeURIComponent(userName)}`);
    const history = await res.json();

    history.forEach(entry => {
      if (entry.user && typeof entry.user === 'string') {
        addMessage('askcmu-user', entry.user);
      }
      if (entry.bot && typeof entry.bot === 'string') {
        addMessage('askcmu-bot', entry.bot);
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

        if (existing.exists()) {
          const oldData = existing.data();
          const updatedLog = Array.isArray(oldData.exchanges)
            ? [...oldData.exchanges, newEntry]
            : [newEntry];

          await setDoc(docRef, {
            userId: userName,
            exchanges: updatedLog
          });
        } else {
          await setDoc(docRef, {
            userId: userName,
            exchanges: [newEntry]
          });
        }
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

function addMessage(senderClass, text) {
  if (!text || typeof text !== 'string') return;

  const msg = document.createElement('div');
  msg.className = `askcmu-message ${senderClass}`;
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
