// ------- Bulletin board demo data & logic (with Edit/Delete) ------- 
document.addEventListener('DOMContentLoaded', () => {
  const bulletins = [
    {id:1,title:'Holiday Notice',body:'Office closed on Sept 25 for local holiday.'},
    {id:2,title:'New SOP',body:'Updated patrol SOP v2.1 uploaded. Read and acknowledge.'},
    {id:3,title:'Safety Tip',body:'Always wear non-slip shoes during rainy season.'}
  ];

  const track = document.getElementById('bulletinTrack');
  const prevBtn = document.getElementById('bulletPrev');
  const nextBtn = document.getElementById('bulletNext');
  let bulletIndex = 0;

  // Modal elements
  const createBtn = document.getElementById('createBulletinBtn');
  const modal = document.getElementById('createBulletinModal');
  const closeBtn = document.getElementById('closeBulletinModal');
  const form = document.getElementById('bulletinForm');

  // track current editing id (null when creating)
  let currentEditId = null;

  function escapeHtml(s){
    return String(s)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#39;");
  }

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
      card.innerHTML = `
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

  function updateBulletTransform(){
    const card = track.children[0];
    const width = card ? card.getBoundingClientRect().width + 16 : 320;
    track.style.transform = `translateX(${-bulletIndex * width}px)`;
  }

  prevBtn.addEventListener('click', ()=>{
    bulletIndex = Math.max(0, bulletIndex-1);
    updateBulletTransform();
  });
  nextBtn.addEventListener('click', ()=>{
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

  // Modal open/close + prepare for create/edit
  createBtn.addEventListener('click', () => {
    currentEditId = null;
    // clear form
    form.elements['title'].value = '';
    form.elements['body'].value = '';
    modal.classList.remove('hidden');
  });
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Delegated click handler for Edit/Delete buttons inside track
  track.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.editBulletinBtn');
    const delBtn = e.target.closest('.deleteBulletinBtn');
    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const b = bulletins.find(x => x.id === id);
      if (!b) return;
      currentEditId = id;
      form.elements['title'].value = b.title;
      form.elements['body'].value = b.body;
      modal.classList.remove('hidden');
      // ensure the edited card is visible
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
      // adjust index so UI doesn't jump incorrectly
      if (bulletIndex > 0 && bulletIndex >= bulletins.length) bulletIndex = bulletins.length - 1;
      renderBulletins();
      return;
    }
  });

  // Handle form submission (create or edit)
  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = String(form.elements['title'].value || '').trim();
    const body = String(form.elements['body'].value || '').trim();
    if (!title || !body) {
      alert('Please enter title and body.');
      return;
    }
    if (currentEditId) {
      // update existing
      const b = bulletins.find(x => x.id === currentEditId);
      if (b) {
        b.title = title;
        b.body = body;
        b.date = new Date().toISOString().split('T')[0];
      }
    } else {
      // create new at end
      const newItem = { id: Date.now(), title, body, date: new Date().toISOString().split('T')[0] };
      bulletins.push(newItem);
      // move view to new item
      bulletIndex = Math.max(0, bulletins.length - 1);
    }
    currentEditId = null;
    form.reset();
    modal.classList.add('hidden');
    renderBulletins();
  });

  // initial render
  renderBulletins();
});