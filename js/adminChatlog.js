document.addEventListener("DOMContentLoaded", () => {
  fetch('../php/fetch-chatlog.php')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('chatlog-ui-container');
      container.innerHTML = '';

      data.forEach(log => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chatlog-ui-entry';

        const header = document.createElement('h3');
        header.textContent = `User: ${log.userId}`;
        wrapper.appendChild(header);

        const list = document.createElement('ul');
        log.exchanges.forEach(entry => {
          const item = document.createElement('li');
             item.innerHTML = `<strong>${entry.timestamp}</strong><br>
            <span class="chatlog-ui-user">👤 ${entry.userMessage || entry.user}</span><br>
             <span class="chatlog-ui-bot">🤖 ${entry.botResponse || entry.bot}</span>`;

          list.appendChild(item);
        });
        wrapper.appendChild(list);

        // Archive button
        const archiveBtn = document.createElement('button');
        archiveBtn.textContent = 'Archive';
        archiveBtn.onclick = () => archiveLog(log.userId);
        wrapper.appendChild(archiveBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteLog(log.userId);
        wrapper.appendChild(deleteBtn);

        container.appendChild(wrapper);
      });
    })
    .catch(err => {
      document.getElementById('chatlog-ui-container').innerHTML =
        '<p class="chatlog-ui-error">Error loading chat logs.</p>';
      console.error(err);
    });
});

// 🔥 Delete log from Firestore
async function deleteLog(userId) {
  if (!confirm(`Delete all logs for ${userId}? This cannot be undone.`)) return;

  try {
    const res = await fetch('../php/delete-chatlog.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userId=${encodeURIComponent(userId)}`
    });

    const result = await res.text();
    alert(result);
    location.reload();
  } catch (err) {
    console.error("Failed to delete log:", err);
    alert("Error deleting log.");
  }
}

// 📦 Archive log (mark as archived)
async function archiveLog(userId) {
  try {
    const res = await fetch('../php/archive-chatlog.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `userId=${encodeURIComponent(userId)}`
    });

    const result = await res.text();
    alert(result);
    location.reload();
  } catch (err) {
    console.error("Failed to archive log:", err);
    alert("Error archiving log.");
  }
}
