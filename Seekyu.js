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

// Ensure SeekYu exists
window.SeekYu = window.SeekYu || {};

// Unified popup show/hide using .hidden
SeekYu.showPopup = function(id) {
  const el = document.getElementById(id);
  if (!el) return console.warn('showPopup: missing', id);
  el.classList.remove('hidden');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  // focus first focusable for accessibility
  setTimeout(() => {
    const focusable = el.querySelector('button, [href], input, textarea, select');
    if (focusable) focusable.focus();
  }, 10);
};

SeekYu.hidePopup = function(id) {
  const el = document.getElementById(id);
  if (!el) return console.warn('hidePopup: missing', id);
  el.classList.add('hidden');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
};

// Close on X (.close-btn), click outside content, or ESC
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.close-btn');
  if (btn) {
    const popup = btn.closest('.popup');
    if (popup) SeekYu.hidePopup(popup.id);
    return;
  }
  // click outside popup-content
  const popupBg = e.target.closest('.popup');
  if (popupBg && !e.target.closest('.popup-content')) {
    SeekYu.hidePopup(popupBg.id);
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.popup:not(.hidden)').forEach(p => SeekYu.hidePopup(p.id));
  }
});

// ---------------- KPI logic (in-memory store) ----------------
SeekYu.kpiData = SeekYu.kpiData || {};

// open evaluation form (call from button onclick="openEvaluationForm('SG001')")
window.openEvaluationForm = function(empId) {
  document.getElementById('employeeId').value = empId;
  const prev = SeekYu.kpiData[empId] || null;
  document.getElementById('attendance').value = prev ? prev.attendance : '';
  document.getElementById('discipline').value = prev ? prev.discipline : '';
  document.getElementById('alertness').value = prev ? prev.alertness : '';
  document.getElementById('communication').value = prev ? prev.communication : '';
  SeekYu.showPopup('kpiFormPopup');
};

// open view score popup
window.openViewScore = function(empId) {
  const s = SeekYu.kpiData[empId];
  if (!s) {
    document.getElementById('scoreDetails').innerHTML = `<p>No KPI evaluation found for <strong>${empId}</strong>.</p>`;
  } else {
    const avg = ((+s.attendance + +s.discipline + +s.alertness + +s.communication) / 4).toFixed(2);
    document.getElementById('scoreDetails').innerHTML = `
      <p><strong>Employee:</strong> ${empId}</p>
      <p><strong>Attendance:</strong> ${s.attendance}</p>
      <p><strong>Discipline:</strong> ${s.discipline}</p>
      <p><strong>Alertness:</strong> ${s.alertness}</p>
      <p><strong>Communication:</strong> ${s.communication}</p>
      <p><strong>Average Score:</strong> ${avg} / 5</p>
    `;
  }
  SeekYu.showPopup('kpiScorePopup');
};

// handle KPI form submit
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('kpiForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const empId = document.getElementById('employeeId').value || 'Unknown';
      const attendance = Number(document.getElementById('attendance').value);
      const discipline = Number(document.getElementById('discipline').value);
      const alertness = Number(document.getElementById('alertness').value);
      const communication = Number(document.getElementById('communication').value);
      const vals = [attendance, discipline, alertness, communication];
      if (vals.some(v => Number.isNaN(v) || v < 1 || v > 5)) {
        alert('Please provide values between 1 and 5 for all fields.');
        return;
      }
      SeekYu.kpiData[empId] = { attendance, discipline, alertness, communication, updatedAt: new Date().toISOString() };
      SeekYu.hidePopup('kpiFormPopup');
      // optionally show the score
      openViewScore(empId);
    });
  }
});
