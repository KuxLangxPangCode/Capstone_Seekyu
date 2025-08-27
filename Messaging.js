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

// --- Delete Message Row ---
SeekYu.deleteMessage = function (btn) {
  if (confirm("Are you sure you want to delete this message?")) {
    let row = btn.closest("tr");
    row.remove();
  }
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
