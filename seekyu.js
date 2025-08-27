// Global SeekYu object for section, sub-section, and popup handling
window.SeekYu = {
  showSection: function (id) {
    document.querySelectorAll('.section, .page').forEach(el => {
      el.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  },

  showSubSection: function (id) {
    document.querySelectorAll('.sub-section').forEach(sub => {
      sub.classList.remove('active');
    });
    const sub = document.getElementById(id);
    if (sub) sub.classList.add('active');
  },

  showPopup: function (type) {
    const popup = document.getElementById(`${type}Popup`);
    if (popup) popup.style.display = 'flex';
  },

  hidePopup: function (type) {
    const popup = document.getElementById(`${type}Popup`);
    if (popup) popup.style.display = 'none';
  }
};

// Alias
window.App = {
  showSection: SeekYu.showSection,
  showSubSection: SeekYu.showSubSection,
  showPopup: SeekYu.showPopup,
  hidePopup: SeekYu.hidePopup
};

// Close popup if clicking outside the content
window.addEventListener('click', function (e) {
  document.querySelectorAll('.popup').forEach(popup => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });
});

// Default section
document.addEventListener("DOMContentLoaded", function () {
  SeekYu.showSection('dashboard');
});

// ========== Leave Requests Search ==========
const leaveSearch = document.getElementById('leaveSearch');
if (leaveSearch) {
  const leaveTable = document.getElementById('leaveTable').getElementsByTagName('tbody')[0];
  leaveSearch.addEventListener('keyup', function() {
    const filter = leaveSearch.value.toLowerCase();
    const rows = leaveTable.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      let rowText = rows[i].innerText.toLowerCase();
      rows[i].style.display = rowText.includes(filter) ? '' : 'none';
    }
  });
}

// ========== Incident Reports Search ==========
const incidentSearch = document.getElementById("incidentSearch");
if (incidentSearch) {
  incidentSearch.addEventListener("keyup", function () {
    let filter = this.value.toLowerCase();
    document.querySelectorAll(".incident-table tbody tr").forEach(row => {
      let text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? "" : "none";
    });
  });
}

// Incident Report Modal
const modal = document.getElementById("incidentModal");
if (modal) {
  const modalIncident = document.getElementById("modalIncident");
  const modalDate = document.getElementById("modalDate");
  const modalLocation = document.getElementById("modalLocation");
  const modalDetails = document.getElementById("modalDetails");

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      modalIncident.textContent = this.dataset.incident;
      modalDate.textContent = this.dataset.date;
      modalLocation.textContent = this.dataset.location;
      modalDetails.textContent = this.dataset.details;
      modal.style.display = "block";
    });
  });

  document.querySelector(".close-btn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target == modal) modal.style.display = "none";
  });
}

// ========== Recruitment Search ==========
const recruitSearch = document.getElementById('recruitSearch');
if (recruitSearch) {
  const recruitTable = document.getElementById('recruitTable').getElementsByTagName('tbody')[0];
  recruitSearch.addEventListener('keyup', function() {
    const filter = recruitSearch.value.toLowerCase();
    const rows = recruitTable.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      let rowText = rows[i].innerText.toLowerCase();
      rows[i].style.display = rowText.includes(filter) ? '' : 'none';
    }
  });
}

// Recruitment Accept/Reject
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('accept-btn')) {
    e.target.closest('tr').querySelector('td:nth-child(7)').innerText = "Accepted";
  }
  if (e.target.classList.contains('reject-btn')) {
    e.target.closest('tr').querySelector('td:nth-child(7)').innerText = "Rejected";
  }
});



