/* script.js */
// 1. Firebase Modules Import karein (Top par)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA-ZjRYJW_3Y2EWDo6OZIVdXcP7rHIdWY4",
  authDomain: "zigpt-beta.firebaseapp.com",
  databaseURL: "https://zigpt-beta-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zigpt-beta",
  storageBucket: "zigpt-beta.firebasestorage.app",
  messagingSenderId: "656169334494",
  appId: "1:656169334494:web:aa30ed1bca6407f971b44f"
};
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe6YAz7frkIEucV6PCs9sl1-IirYFVHJbK0cYU9xjXo5BU3xj7hkVi4YLZMYZnILa2Gg/exec";

// 3. GLOBAL FUNCTIONS (Ye window. ke sath likhna lazmi hai)
window.autoGrow = function(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
};

window.sendMessage = async function() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.style.display = 'none';

    const botDiv = addBubble(text, 'user'); // User message
    const thinkingDiv = addBubble('ZiGPT is thinking...', 'bot');

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: text }] }] })
        });
        const data = await response.json();
        const botText = data.candidates[0].content.parts[0].text;
        
        thinkingDiv.innerHTML = botText; // AI Answer

        // Save to Firestore
        await addDoc(collection(db, "ChatHistory"), {
            text: botText,
            role: "bot",
            timestamp: serverTimestamp()
        });
    } catch (e) {
        thinkingDiv.innerText = "Error: Connection failed.";
    }
};

function addBubble(text, role) {
    const chatWin = document.getElementById('chatWindow');
    const div = document.createElement('div');
    div.className = `message-row ${role === 'bot' ? 'bot-row' : 'user-row'}`;
    div.innerHTML = `<div class="bubble">${text}</div>`;
    chatWin.appendChild(div);
    chatWin.scrollTop = chatWin.scrollHeight;
    return div.querySelector('.bubble');
}

document.getElementById('sendBtn').onclick = sendMessage;

window.toggleSidebar = () => {
    // Mobile sidebar toggle logic can be added here
};

window.resetChat = () => location.reload();

// Data save karne ka asaan function
async function saveToFirestore(role, message) {
    try {
        await addDoc(collection(db, "ChatHistory"), {
            role: role,
            text: message,
            timestamp: serverTimestamp()
        });
        console.log("History Saved!");
    } catch (e) {
        console.error("Database Error: ", e);
    }
}