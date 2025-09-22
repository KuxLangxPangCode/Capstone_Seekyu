document.addEventListener('DOMContentLoaded', () => {

  // ---------- Utilities ----------
  function escapeHtml(s){
    return String(s || '')
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#39;");
  }

  // ---------- Bulletin board module ----------
  function initBulletins() {
    const track = document.getElementById('bulletinTrack');
    const prevBtn = document.getElementById('bulletPrev');
    const nextBtn = document.getElementById('bulletNext');
    const createBtn = document.getElementById('createBulletinBtn');
    const bulletinModal = document.getElementById('createBulletinModal');
    const closeBulletinModal = document.getElementById('closeBulletinModal');
    const form = document.getElementById('bulletinForm');
    const cancelBtn = document.getElementById('cancelBulletin');
    const modalTitleText = document.getElementById('modalTitleText');
    const bulletinImageFile = document.getElementById('bulletinImageFile');
    const modalImagePreview = document.getElementById('modalImagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');

    if (!track || !createBtn || !bulletinModal || !form) return;

    const bulletins = [
      {id:1,title:'Holiday Notice',body:'Office closed on Sept 25 for local holiday.', date: '2025-09-01', image: null},
      {id:2,title:'New SOP',body:'Updated patrol SOP v2.1 uploaded. Read and acknowledge.', date: '2025-09-05', image: null},
      {id:3,title:'Safety Tip',body:'Always wear non-slip shoes during rainy season.', date: '2025-09-10', image: null}
    ];

    let bulletIndex = 0;
    let currentEditId = null;
    let modalImageData = null;

    function renderBulletins(){
      track.innerHTML = '';
      if (bulletins.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'p-4 text-sm text-slate-500';
        empty.textContent = 'No announcements yet. Click Create Announcement to add one.';
        track.appendChild(empty);
        updateBulletTransform();
        return;
      }

      for(const b of bulletins){
        const card = document.createElement('div');
        card.className = 'bulletin-card bg-white p-4 rounded-lg border shadow-sm';
        card.style.minWidth = '300px';

        const imageHtml = b.image ? `<div class="mb-3"><img src="${b.image}" alt="${escapeHtml(b.title)}" class="w-full h-36 object-cover rounded" /></div>` : '';

        card.innerHTML = `
          ${imageHtml}
          <div class="flex items-start justify-between">
            <div>
              <div class="text-sm text-slate-500">${escapeHtml(b.date || '')}</div>
              <h4 class="font-semibold mt-1">${escapeHtml(b.title)}</h4>
            </div>
            <div class="text-right flex flex-col gap-2">
              <button data-id="${b.id}" class="editBulletinBtn px-2 py-1 text-sm rounded bg-white border">Edit</button>
              <button data-id="${b.id}" class="deleteBulletinBtn px-2 py-1 text-sm rounded bg-red-600 text-white">Delete</button>
            </div>
          </div>
          <p class="text-sm text-slate-600 mt-3 whitespace-pre-wrap">${escapeHtml(b.body)}</p>
        `;
        track.appendChild(card);
      }

      // clamp index
      bulletIndex = Math.max(0, Math.min(bulletIndex, Math.max(0, track.children.length - 1)));
      updateBulletTransform();
    }

    function getCardWidth() {
      const card = track.querySelector('.bulletin-card');
      if (!card) return 320;
      const styleGap = 16; // your gap in px
      return Math.ceil(card.getBoundingClientRect().width + styleGap);
    }

    function updateBulletTransform(){
      const w = getCardWidth();
      track.style.transform = `translateX(${-bulletIndex * w}px)`;
    }

    prevBtn?.addEventListener('click', ()=>{
      bulletIndex = Math.max(0, bulletIndex-1);
      updateBulletTransform();
    });
    nextBtn?.addEventListener('click', ()=>{
      bulletIndex = Math.min(Math.max(0, track.children.length - 1), bulletIndex+1);
      updateBulletTransform();
    });

    window.addEventListener('resize', updateBulletTransform);

    const autoAdvanceInterval = setInterval(()=>{
      if (bulletins.length > 0) {
        bulletIndex = (bulletIndex+1) % bulletins.length;
        updateBulletTransform();
      }
    }, 5000);

    // open create modal
    createBtn.addEventListener('click', () => {
      currentEditId = null;
      modalTitleText.textContent = 'Create Announcement';
      form.elements['title'].value = '';
      form.elements['body'].value = '';
      modalImageData = null;
      bulletinImageFile.value = '';
      modalImagePreview.src = '';
      modalImagePreview.classList.add('hidden');
      removeImageBtn.classList.add('hidden');
      bulletinModal.classList.remove('hidden');
      bulletinModal.classList.add('flex');
    });

    function openEditModal(bulletin) {
      currentEditId = bulletin.id;
      modalTitleText.textContent = 'Edit Announcement';
      form.elements['title'].value = bulletin.title;
      form.elements['body'].value = bulletin.body;
      modalImageData = bulletin.image || null;
      if (modalImageData) {
        modalImagePreview.src = modalImageData;
        modalImagePreview.classList.remove('hidden');
        removeImageBtn.classList.remove('hidden');
      } else {
        modalImagePreview.src = '';
        modalImagePreview.classList.add('hidden');
        removeImageBtn.classList.add('hidden');
      }
      bulletinImageFile.value = '';
      bulletinModal.classList.remove('hidden');
      bulletinModal.classList.add('flex');
    }

    closeBulletinModal?.addEventListener('click', () => {
      bulletinModal.classList.remove('flex');
      bulletinModal.classList.add('hidden');
    });
    cancelBtn?.addEventListener('click', () => {
      bulletinModal.classList.remove('flex');
      bulletinModal.classList.add('hidden');
    });
    bulletinModal?.addEventListener('click', e => {
      if (e.target === bulletinModal) {
        bulletinModal.classList.remove('flex');
        bulletinModal.classList.add('hidden');
      }
    });

    track.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.editBulletinBtn');
      const delBtn = e.target.closest('.deleteBulletinBtn');
      if (editBtn) {
        const id = Number(editBtn.dataset.id);
        const b = bulletins.find(x => x.id === id);
        if (!b) return;
        openEditModal(b);
        const idx = bulletins.findIndex(x => x.id === id);
        if (idx >= 0) { bulletIndex = idx; updateBulletTransform(); }
        return;
      }
      if (delBtn) {
        const id = Number(delBtn.dataset.id);
        if (!confirm('Delete this announcement?')) return;
        const idx = bulletins.findIndex(x => x.id === id);
        if (idx === -1) return;
        bulletins.splice(idx, 1);
        if (bulletIndex > 0 && bulletIndex >= bulletins.length) bulletIndex = bulletins.length - 1;
        renderBulletins();
        return;
      }
    });

    bulletinImageFile?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file.');
        bulletinImageFile.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function(ev) {
        modalImageData = ev.target.result;
        modalImagePreview.src = modalImageData;
        modalImagePreview.classList.remove('hidden');
        removeImageBtn.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });

    removeImageBtn?.addEventListener('click', () => {
      if (!confirm('Remove the current image?')) return;
      modalImageData = null;
      bulletinImageFile.value = '';
      modalImagePreview.src = '';
      modalImagePreview.classList.add('hidden');
      removeImageBtn.classList.add('hidden');
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const title = String(form.elements['title'].value || '').trim();
      const body = String(form.elements['body'].value || '').trim();
      if (!title || !body) {
        alert('Please enter title and body.');
        return;
      }

      if (currentEditId) {
        const b = bulletins.find(x => x.id === currentEditId);
        if (b) {
          b.title = title;
          b.body = body;
          b.date = new Date().toISOString().split('T')[0];
          b.image = modalImageData || null;
        }
      } else {
        const newItem = {
          id: Date.now(),
          title,
          body,
          date: new Date().toISOString().split('T')[0],
          image: modalImageData || null
        };
        bulletins.push(newItem);
        bulletIndex = Math.max(0, bulletins.length - 1);
      }
      currentEditId = null;
      form.reset();
      modalImageData = null;
      bulletinImageFile.value = '';
      modalImagePreview.src = '';
      modalImagePreview.classList.add('hidden');
      removeImageBtn.classList.add('hidden');
      bulletinModal.classList.remove('flex');
      bulletinModal.classList.add('hidden');
      renderBulletins();
    });

    renderBulletins();
  } // end initBulletins


  // ---------- Profile module ----------
  function initProfile() {
    const profilePic = document.getElementById('profilePic');
    const profileFile = document.getElementById('profileFile');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileSmall = document.getElementById('editProfileSmall');
    const profileModal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelProfile = document.getElementById('cancelProfile');
    const profileForm = document.getElementById('profileForm');
    const modalAvatar = document.getElementById('modalAvatar');
    const modalFile = document.getElementById('modalFile');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const inputFullName = document.getElementById('inputFullName');
    const inputEmail = document.getElementById('inputEmail');
    const inputPhone = document.getElementById('inputPhone');
    const profileNameEl = document.getElementById('profileName');
    const profileRoleEl = document.getElementById('profileRole');

    if (!profileForm || !profileNameEl) return;

    function loadProfile() {
      const raw = localStorage.getItem('seekyu-profile');
      const defaultProfile = {
        fullName: 'Miles P. Pirater',
        email: 'miles@example.com',
        phone: '',
        role: 'HR',
        department: 'Human Resources',
        bio: '',
        avatar: 'https://i.pravatar.cc/100?img=3'
      };
      let profile;
      try {
        profile = raw ? JSON.parse(raw) : defaultProfile;
      } catch (e) {
        profile = defaultProfile;
      }

      profileNameEl.textContent = profile.fullName || defaultProfile.fullName;
      profileRoleEl.textContent = profile.role || defaultProfile.role;
      if (profilePic) profilePic.src = profile.avatar || defaultProfile.avatar;
      if (modalAvatar) modalAvatar.src = profile.avatar || defaultProfile.avatar;

      inputFullName.value = profile.fullName || '';
      inputEmail.value = profile.email || '';
      inputPhone.value = profile.phone || '';
    }

    loadProfile();

    function openProfileModal() {
      if (!profileModal) return;
      profileModal.classList.remove('hidden');
      profileModal.classList.add('flex');
      loadProfile();
    }
    function closeProfileModal() {
      if (!profileModal) return;
      profileModal.classList.remove('flex');
      profileModal.classList.add('hidden');
    }

    editProfileBtn?.addEventListener('click', openProfileModal);
    editProfileSmall?.addEventListener('click', openProfileModal);
    closeModalBtn?.addEventListener('click', closeProfileModal);
    cancelProfile?.addEventListener('click', (e) => { e.preventDefault(); closeProfileModal(); });

    changeAvatarBtn?.addEventListener('click', () => modalFile?.click());
    modalFile?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        modalAvatar.src = ev.target.result;
        if (profilePic) profilePic.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    profileFile?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        if (profilePic) profilePic.src = ev.target.result;
        if (modalAvatar) modalAvatar.src = ev.target.result;
        const raw = localStorage.getItem('seekyu-profile');
        let profile = raw ? JSON.parse(raw) : {};
        profile.avatar = ev.target.result;
        try { localStorage.setItem('seekyu-profile', JSON.stringify(profile)); } catch (err) { console.warn('Could not save avatar to localStorage', err); }
      };
      reader.readAsDataURL(file);
    });

    profileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!inputFullName.value.trim() || !inputEmail.value.trim()) {
        alert('Please provide at least a name and email.');
        return;
      }
      const raw = localStorage.getItem('seekyu-profile');
      let existing = {};
      try { existing = raw ? JSON.parse(raw) : {}; } catch (err) { existing = {}; }

      const updatedProfile = {
        ...existing,
        fullName: inputFullName.value.trim(),
        email: inputEmail.value.trim(),
        phone: inputPhone.value.trim(),
        avatar: (modalAvatar && modalAvatar.src) || (profilePic && profilePic.src)
      };

      try {
        localStorage.setItem('seekyu-profile', JSON.stringify(updatedProfile));
      } catch (err) {
        console.warn('Could not save profile to localStorage', err);
      }

      loadProfile();
      closeProfileModal();
    });
  } // end initProfile


  // ---------- Calendar module ----------
  function initCalendar() {
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    let curr = new Date();
    const calMonthEl = document.getElementById('calendarMonth');
    const daysContainer = document.getElementById('calendarDays');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (!calMonthEl || !daysContainer) return;

    function renderCalendar(date) {
      daysContainer.innerHTML = '';
      const year = date.getFullYear();
      const month = date.getMonth();
      calMonthEl.textContent = monthNames[month] + ' ' + year;

      const firstDay = new Date(year, month, 1);
      const startingDay = firstDay.getDay();
      const daysInMonth = new Date(year, month+1, 0).getDate();

      for (let i = 0; i < startingDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'day-cell text-center text-sm text-gray-300';
        daysContainer.appendChild(blank);
      }

      const today = new Date();
      for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell rounded hover:bg-gray-100 cursor-default text-center p-1';
        cell.textContent = d;

        if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
          cell.classList.add('bg-blue-600','text-white','font-semibold');
          cell.style.borderRadius = '0.5rem';
        } else {
          cell.classList.add('text-gray-700');
        }

        daysContainer.appendChild(cell);
      }
    }

    prevBtn?.addEventListener('click', () => {
      curr = new Date(curr.getFullYear(), curr.getMonth() - 1, 1);
      renderCalendar(curr);
    });
    nextBtn?.addEventListener('click', () => {
      curr = new Date(curr.getFullYear(), curr.getMonth() + 1, 1);
      renderCalendar(curr);
    });

    // Initial render
    renderCalendar(curr);

    // Optional: re-render at next midnight so "today" updates automatically
    (function scheduleMidnightUpdate() {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2); // +2s slack
      const ms = nextMidnight - now;
      setTimeout(() => {
        // update "today" highlighting by re-rendering current view
        renderCalendar(curr);
        // schedule again next midnight
        scheduleMidnightUpdate();
      }, ms);
    })();
  } // end initCalendar


  // Initialize modules
  initBulletins();
  initProfile();
  initCalendar();

}); // end DOMContentLoaded
