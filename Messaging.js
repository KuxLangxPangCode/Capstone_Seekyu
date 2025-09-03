// ============================
// Messaging System (Global)
// ============================

window.SeekYu = window.SeekYu || {};

SeekYu.initMessaging = function () {
  const messaging = document.getElementById("messaging-mgmt");
  if (!messaging) return; // only run if messaging section exists

  // --- Search Filter ---
  const searchBox = document.getElementById("messageSearch");
  if (searchBox) {
    searchBox.addEventListener("keyup", function () {
      let filter = this.value.toLowerCase();
      messaging.querySelectorAll(".message-table tbody tr").forEach(row => {
        let text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    });
  }

  // --- Event Delegation for View & Delete ---
  const tableBody = messaging.querySelector(".message-table tbody");
  if (tableBody) {
    tableBody.addEventListener("click", function (e) {
      if (e.target.classList.contains("view-message-btn")) {
        SeekYu.openMessage({
          from: e.target.dataset.from,
          subject: e.target.dataset.subject,
          date: e.target.dataset.date,
          body: e.target.dataset.body
        });
      }

      if (e.target.classList.contains("delete-message-btn")) {
        SeekYu.deleteMessage(e.target);
      }
    });
  }

  // --- Handle Compose Form ---
  const composeForm = document.getElementById("composeForm");
  if (composeForm) {
    composeForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let recipient = document.getElementById("recipient")?.value.trim();
      let subject = document.getElementById("subject")?.value.trim();
      let body = document.getElementById("message")?.value.trim();
      const date = new Date().toISOString().split("T")[0];

      // fallback values if empty
      recipient = recipient || "Unknown";
      subject = subject || "No subject";
      body = body || "No message content";

      // Add new row in inbox
      const table = messaging.querySelector(".message-table tbody");
      if (table) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${recipient}</td>
          <td>${subject}</td>
          <td>${date}</td>
          <td>
            <button class="view-message-btn"
              data-from="${recipient}"
              data-subject="${subject}"
              data-date="${date}"
              data-body="${body}">
              View
            </button>
            <button class="delete-message-btn">Delete</button>
          </td>
        `;
        table.prepend(row); // newest message first
      }

      // Reset form & return to inbox
      this.reset();
      SeekYu.showSubSection("inbox-section");
    });
  }
};

// --- Function to open popup with message ---
SeekYu.openMessage = function (msg) {
  document.getElementById("popupSender").textContent = msg.from || "Unknown";
  document.getElementById("popupSubject").textContent = msg.subject || "No subject";
  document.getElementById("popupDate").textContent = msg.date || "";
  document.getElementById("popupBody").textContent = msg.body || "";
  SeekYu.showPopup("message-popup");
};

// --- Popup Controls ---
SeekYu.showPopup = function (id) {
  document.getElementById(id).classList.remove("hidden");
};

SeekYu.hidePopup = function (id) {
  document.getElementById(id).classList.add("hidden");
};


// --- Auto initialize when DOM is ready ---
document.addEventListener("DOMContentLoaded", () => {
  SeekYu.initMessaging();
});
document.addEventListener("DOMContentLoaded", () => {
  const inboxBtn = document.getElementById("inboxBtn");
  const composeBtn = document.getElementById("composeBtn");

  if (inboxBtn) {
    inboxBtn.addEventListener("click", () => {
      SeekYu.showSubSection("inbox-section");
    });
  }

  if (composeBtn) {
    composeBtn.addEventListener("click", () => {
      SeekYu.showSubSection("compose-section");
    });
  }
});

    // Message search
    document.getElementById('messageSearch')?.addEventListener('keyup', function() {
      const filter = this.value.toLowerCase();
      document.querySelectorAll('#messageTable tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
      });
    });

    // Delete message functionality
    document.querySelectorAll('.delete-message-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const row = this.closest('tr');
        if (confirm('Are you sure you want to delete this message?')) {
          row.remove();
        }
      });
    });

    // Messaging tabs
    const inboxBtn = document.getElementById("inboxBtn");
    const composeBtn = document.getElementById("composeBtn");
    const inboxSection = document.getElementById("inbox-section");
    const composeSection = document.getElementById("compose-section");

    if (inboxBtn && composeBtn) {
      inboxBtn.addEventListener("click", () => {
        inboxSection.classList.add("active");
        composeSection.classList.remove("active");
        inboxBtn.classList.add("active");
        composeBtn.classList.remove("active");
      });

      composeBtn.addEventListener("click", () => {
        composeSection.classList.add("active");
        inboxSection.classList.remove("active");
        composeBtn.classList.add("active");
        inboxBtn.classList.remove("active");
      });
    }

    // View message functionality
    document.querySelectorAll('.view-message-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.getElementById('popupSender').textContent = this.getAttribute('data-from');
        document.getElementById('popupSubject').textContent = this.getAttribute('data-subject');
        document.getElementById('popupDate').textContent = this.getAttribute('data-date');
        document.getElementById('popupBody').textContent = this.getAttribute('data-body');
        showPopup('message-popup');
      });
    });


    // Delete message functionality - using event delegation
    document.getElementById('messageTable')?.addEventListener('click', function(e) {
      if (e.target.classList.contains('delete-message-btn')) {
        const row = e.target.closest('tr');
        if (confirm('Are you sure you want to delete this message?')) {
          row.remove();
        }
      }
    });

    // View message functionality - using event delegation
    document.getElementById('messageTable')?.addEventListener('click', function(e) {
      if (e.target.classList.contains('view-message-btn')) {
        document.getElementById('popupSender').textContent = e.target.getAttribute('data-from');
        document.getElementById('popupSubject').textContent = e.target.getAttribute('data-subject');
        document.getElementById('popupDate').textContent = e.target.getAttribute('data-date');
        document.getElementById('popupBody').textContent = e.target.getAttribute('data-body');
        showPopup('message-popup');
      }
    });

    // Handle compose form submission
    document.getElementById('composeForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const recipient = document.getElementById('recipient').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Create new table row
      const tableBody = document.querySelector('#messageTable tbody');
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-id', Date.now()); // Unique ID
      
      newRow.innerHTML = `
        <td>${recipient}</td>
        <td>${subject}</td>
        <td>${date}</td>
        <td>
          <button class="view-message-btn" data-from="${recipient}" data-subject="${subject}" data-date="${date}" data-body="${message}">View</button>
          <button class="delete-message-btn">Delete</button>
        </td>
      `;
      
      // Add to top of table
      tableBody.insertBefore(newRow, tableBody.firstChild);
      
      // Reset form
      this.reset();
      
      // Show success message
      alert('Message sent successfully!');
      
      // Switch to inbox
      document.getElementById('inboxBtn').click();
    });
