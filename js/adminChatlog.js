document.addEventListener("DOMContentLoaded", loadChatLogs);

// 🔁 Modular fetch and render logic
async function loadChatLogs() {
  try {
    const res = await fetch('../php/fetch-chatlog.php');
    const data = await res.json();

    const userList = document.getElementById('chatlog-ui-userlist');
    const viewer = document.getElementById('chatlog-ui-viewer');
    const alerts = document.getElementById('chatlog-ui-alerts');

    userList.innerHTML = '';
    viewer.innerHTML = '<p>Select a user to view their conversation.</p>';

    data.forEach(log => {
      const entry = document.createElement('div');
      entry.className = 'user-entry';
      entry.id = `chatlog-${log.userId}`;

      const header = document.createElement('h3');
      header.textContent = `User: ${log.userId}`;
      entry.appendChild(header);

      // 📦 Archive button
      const archiveBtn = document.createElement('button');
      archiveBtn.textContent = 'Archive';
      archiveBtn.onclick = (e) => {
        e.stopPropagation();
        archiveLog(log.userId);
      };
      entry.appendChild(archiveBtn);

      // 🔥 Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteLog(log.userId);
      };
      entry.appendChild(deleteBtn);

      // 💬 Click to view conversation
      entry.onclick = () => {
        viewer.setAttribute('data-current-user', log.userId);
        viewer.innerHTML = '';
        const list = document.createElement('ul');

        log.exchanges.forEach(entry => {
          const item = document.createElement('li');
          item.innerHTML = `<strong>${entry.timestamp}</strong><br>
            <span class="chatlog-ui-user">👤 ${entry.userMessage || entry.user}</span><br>
            <span class="chatlog-ui-bot">🤖 ${entry.botResponse || entry.bot}</span>`;
          list.appendChild(item);
        });

        viewer.appendChild(list);

        const note = document.createElement('li');
        note.textContent = `Viewed conversation for ${log.userId}`;
        alerts.appendChild(note);
      };

      userList.appendChild(entry);
    });

    // 🔍 Search bar logic
    document.getElementById('userSearch').addEventListener('input', function () {
      const query = this.value.toLowerCase();
      document.querySelectorAll('.user-entry').forEach(entry => {
        const name = entry.querySelector('h3').textContent.toLowerCase();
        entry.style.display = name.includes(query) ? 'block' : 'none';
      });
    });
  } catch (err) {
    const userList = document.getElementById('chatlog-ui-userlist');
    userList.innerHTML = '<p class="chatlog-ui-error">Error loading chat logs.</p>';
    console.error(err);
  }
}

// 🔥 Delete log from Firestore and refresh UI
async function deleteLog(userId) {
  if (!confirm(`Delete all logs for ${userId}? This cannot be undone.`)) return;

  try {
    const res = await fetch('../php/chatlog-api/delete-chatlog.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userId=${encodeURIComponent(userId)}`
    });

    const result = await res.text();
    alert(result);

    // 🧹 Remove user entry from list
    const entry = document.getElementById(`chatlog-${userId}`);
    if (entry) entry.remove();

    // 🧹 Clear viewer if this user was selected
    const viewer = document.getElementById('chatlog-ui-viewer');
    const currentUser = viewer.getAttribute('data-current-user');
    if (currentUser === userId) {
      viewer.innerHTML = '<p>Select a user to view their conversation.</p>';
      viewer.removeAttribute('data-current-user');
    }
  } catch (err) {
    console.error("Failed to delete log:", err);
    alert("Error deleting log.");
  }
}

// 📦 Archive log (mark as archived)
async function archiveLog(userId) {
  try {
    const res = await fetch('../php/chatlog-api/archive-chatlog.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userId=${encodeURIComponent(userId)}`
    });

    const result = await res.text();
    alert(result);
    await loadChatLogs(); // ✅ Refresh UI
  } catch (err) {
    console.error("Failed to archive log:", err);
    alert("Error archiving log.");
  }
}
