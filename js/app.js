/**
 * Marco Travel - Admin Panel JavaScript
 * CRUD Operations via Fetch API for Packages, Gallery, and Settings
 */

// Otomatis deteksi lingkungan (lokal vs produksi)
const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api'
  : 'https://admin-api-tau.vercel.app/api';

const API_PAKET = `${BASE_URL}/paket`;
const API_GALERI = `${BASE_URL}/galeri`;
const API_PENGATURAN = `${BASE_URL}/pengaturan`;

let allPakets = [];
let allGaleri = [];

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Load default page
  showPage('dashboard');
});

// ============================================
// PAGE SWITCHER
// ============================================
function showPage(pageId) {
  // Sembunyikan semua halaman
  document.getElementById('pageDashboard').style.display = 'none';
  document.getElementById('pageGaleri').style.display = 'none';
  document.getElementById('pagePengaturan').style.display = 'none';

  // Hapus kelas aktif di navigasi
  document.getElementById('navDashboard').classList.remove('active');
  document.getElementById('navGaleri').classList.remove('active');
  document.getElementById('navPengaturan').classList.remove('active');

  // Tampilkan halaman aktif & beri tanda aktif di sidebar
  if (pageId === 'dashboard') {
    document.getElementById('pageDashboard').style.display = 'block';
    document.getElementById('navDashboard').classList.add('active');
    loadPakets();
  } else if (pageId === 'galeri') {
    document.getElementById('pageGaleri').style.display = 'block';
    document.getElementById('navGaleri').classList.add('active');
    loadGaleri();
  } else if (pageId === 'pengaturan') {
    document.getElementById('pagePengaturan').style.display = 'block';
    document.getElementById('navPengaturan').classList.add('active');
    loadPengaturan();
  }

  // Tutup sidebar di versi mobile jika terbuka
  const sidebar = document.querySelector('.sidebar');
  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// ============================================
// LOAD PAKET DATA
// ============================================
async function loadPakets() {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const res = await fetch(API_PAKET);
    const json = await res.json();

    if (json.success) {
      allPakets = json.data;
      renderStats();
      renderTable(allPakets);
    } else {
      container.innerHTML = `<div class="empty-state"><h3>Gagal memuat data</h3><p>${json.message}</p></div>`;
    }
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Tidak dapat terhubung ke server</h3><p>Pastikan Express server Anda berjalan.</p></div>';
  }
}

// ============================================
// RENDER STATS (PAKET)
// ============================================
function renderStats() {
  document.getElementById('statTotal').textContent = allPakets.length;
  document.getElementById('statHighlight').textContent = allPakets.filter(p => p.highlight).length;

  const first = allPakets[0];
  document.getElementById('statKeberangkatan').textContent = first ? first.keberangkatan : '-';

  if (allPakets.length > 0) {
    const prices = allPakets.map(p => {
      const num = p.harga.replace(/[^0-9]/g, '');
      return parseInt(num) || 0;
    });
    const min = Math.min(...prices);
    document.getElementById('statHarga').textContent = 'Rp ' + min.toLocaleString('id-ID');
  }
}

// ============================================
// RENDER PAKET TABLE
// ============================================
function renderTable(data) {
  const container = document.getElementById('tableContainer');

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <h3>Belum ada paket travel</h3>
        <p>Klik tombol "Tambah Paket" untuk menambahkan paket baru</p>
      </div>`;
    return;
  }

  let html = `<table class="data-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Paket</th>
        <th>Harga</th>
        <th>Durasi</th>
        <th>Badge</th>
        <th>Rating</th>
        <th>Highlight</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>`;

  data.forEach((p, i) => {
    const badgeClass = getBadgeClass(p.badgeColor);
    const stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);

    html += `<tr>
      <td>${i + 1}</td>
      <td>
        <div class="td-paket">
          <img src="${p.image}" alt="${p.nama}" onerror="this.src='https://placehold.co/48x48/1a5c3a/fff?text=📦'">
          <div>
            <div class="paket-name">${p.nama}</div>
            <div class="paket-sub">${p.maskapai} · ${p.keberangkatan}</div>
          </div>
        </div>
      </td>
      <td><strong>${p.harga}</strong></td>
      <td>${p.durasi}</td>
      <td>${p.badge ? `<span class="badge-cell ${badgeClass}">${p.badge}</span>` : '-'}</td>
      <td><span class="rating-stars">${stars}</span></td>
      <td><span class="highlight-dot ${p.highlight ? 'yes' : 'no'}"></span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" onclick="editPaket(${p.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" title="Hapus" onclick="confirmDelete(${p.id}, '${p.nama.replace(/'/g, "\\'")}', 'paket')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function getBadgeClass(color) {
  if (!color) return '';
  if (color.includes('red')) return 'badge-red';
  if (color.includes('1a5c3a') || color.includes('green')) return 'badge-green';
  if (color.includes('c9a84c') || color.includes('gold') || color.includes('yellow')) return 'badge-gold';
  if (color.includes('purple')) return 'badge-purple';
  return 'badge-green';
}

// ============================================
// SEARCH / FILTER (PAKET)
// ============================================
function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allPakets.filter(p =>
    p.nama.toLowerCase().includes(q) ||
    p.maskapai.toLowerCase().includes(q) ||
    p.harga.toLowerCase().includes(q) ||
    (p.badge && p.badge.toLowerCase().includes(q))
  );
  renderTable(filtered);
}

// ============================================
// MODAL PAKET - OPEN / CLOSE
// ============================================
function openModal(editData = null) {
  const overlay = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('paketForm');
  form.reset();
  document.getElementById('formId').value = '';

  if (editData) {
    title.textContent = 'Edit Paket';
    document.getElementById('formId').value = editData.id;
    document.getElementById('formNama').value = editData.nama;
    document.getElementById('formHarga').value = editData.harga;
    document.getElementById('formDurasi').value = editData.durasi;
    document.getElementById('formKapasitas').value = editData.kapasitas;
    document.getElementById('formRating').value = editData.rating;
    document.getElementById('formBadge').value = editData.badge || '';
    document.getElementById('formBadgeColor').value = editData.badgeColor || '';
    document.getElementById('formImage').value = editData.image || '';
    document.getElementById('formKeberangkatan').value = editData.keberangkatan;
    document.getElementById('formMaskapai').value = editData.maskapai;
    document.getElementById('formHotel').value = editData.hotel;
    document.getElementById('formHighlight').value = editData.highlight ? '1' : '0';
    document.getElementById('formWa').value = editData.wa;
    document.getElementById('formDeskripsi').value = editData.deskripsi;
    document.getElementById('formFasilitas').value = (editData.fasilitas || []).join('\n');
    document.getElementById('formItinerary').value = (editData.itinerary || []).join('\n');
    document.getElementById('formIncludes').value = (editData.includes || []).join('\n');
    document.getElementById('formExcludes').value = (editData.excludes || []).join('\n');
  } else {
    title.textContent = 'Tambah Paket Baru';
  }

  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// ============================================
// EDIT PAKET - Load data into modal
// ============================================
async function editPaket(id) {
  try {
    const res = await fetch(`${API_PAKET}?id=${id}`);
    const json = await res.json();
    if (json.success) {
      openModal(json.data);
    } else {
      showToast('Gagal memuat data paket', 'error');
    }
  } catch {
    showToast('Tidak dapat terhubung ke server', 'error');
  }
}

// ============================================
// FORM PAKET SUBMIT (CREATE / UPDATE)
// ============================================
async function handleSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('formId').value;
  const isEdit = !!id;

  const toArray = (val) => val.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  const payload = {
    nama: document.getElementById('formNama').value.trim(),
    harga: document.getElementById('formHarga').value.trim(),
    durasi: document.getElementById('formDurasi').value.trim(),
    kapasitas: document.getElementById('formKapasitas').value.trim(),
    rating: parseInt(document.getElementById('formRating').value),
    badge: document.getElementById('formBadge').value.trim() || null,
    badgeColor: document.getElementById('formBadgeColor').value || null,
    image: document.getElementById('formImage').value.trim() || '/images/default.jpg',
    keberangkatan: document.getElementById('formKeberangkatan').value.trim(),
    maskapai: document.getElementById('formMaskapai').value.trim(),
    hotel: document.getElementById('formHotel').value.trim(),
    highlight: parseInt(document.getElementById('formHighlight').value) === 1,
    wa: document.getElementById('formWa').value.trim(),
    deskripsi: document.getElementById('formDeskripsi').value.trim(),
    fasilitas: toArray(document.getElementById('formFasilitas').value),
    itinerary: toArray(document.getElementById('formItinerary').value),
    includes: toArray(document.getElementById('formIncludes').value),
    excludes: toArray(document.getElementById('formExcludes').value),
  };

  if (isEdit) payload.id = parseInt(id);

  try {
    const res = await fetch(API_PAKET, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.success) {
      showToast(isEdit ? 'Paket berhasil diperbarui!' : 'Paket berhasil ditambahkan!', 'success');
      closeModal();
      loadPakets();
    } else {
      showToast(json.message || 'Terjadi kesalahan', 'error');
    }
  } catch {
    showToast('Tidak dapat terhubung ke server', 'error');
  }
}

// ============================================
// LOAD GALERI DATA
// ============================================
async function loadGaleri() {
  const container = document.getElementById('galeriContainer');
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const res = await fetch(API_GALERI);
    const json = await res.json();

    if (json.success) {
      allGaleri = json.data;
      document.getElementById('statGaleriTotal').textContent = allGaleri.length;
      renderGaleriTable(allGaleri);
    } else {
      container.innerHTML = `<div class="empty-state"><h3>Gagal memuat data galeri</h3><p>${json.message}</p></div>`;
    }
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Tidak dapat terhubung ke server</h3><p>Pastikan Express server Anda berjalan.</p></div>';
  }
}

// ============================================
// RENDER GALERI TABLE
// ============================================
function renderGaleriTable(data) {
  const container = document.getElementById('galeriContainer');

  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <h3>Belum ada foto galeri</h3>
        <p>Klik tombol "Tambah Foto" untuk menambahkan foto baru</p>
      </div>`;
    return;
  }

  let html = `<table class="data-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Gambar</th>
        <th>Judul / Keterangan</th>
        <th>Kategori</th>
        <th>Aspek Rasio</th>
        <th>Aksi</th>
      </tr>
    </thead>
    <tbody>`;

  data.forEach((g, i) => {
    html += `<tr>
      <td>${i + 1}</td>
      <td>
        <div class="td-paket">
          <img src="${g.image}" alt="${g.title}" onerror="this.src='https://placehold.co/48x48/1a5c3a/fff?text=🖼️'" style="width: 60px; height: 48px; border-radius: 6px;">
        </div>
      </td>
      <td><strong>${g.title || '-'}</strong></td>
      <td><span class="badge-cell badge-green">${g.category || 'Galeri'}</span></td>
      <td>${g.tall ? 'Portrait (Tinggi)' : 'Landscape/Square'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" onclick="editGaleri(${g.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" title="Hapus" onclick="confirmDelete(${g.id}, '${(g.title || 'Foto ' + g.id).replace(/'/g, "\\'")}', 'galeri')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ============================================
// MODAL GALERI - OPEN / CLOSE
// ============================================
function openGaleriModal(editData = null) {
  const overlay = document.getElementById('galeriModalOverlay');
  const title = document.getElementById('galeriModalTitle');
  const form = document.getElementById('galeriForm');
  form.reset();
  document.getElementById('galeriFormId').value = '';

  if (editData) {
    title.textContent = 'Edit Foto Galeri';
    document.getElementById('galeriFormId').value = editData.id;
    document.getElementById('galeriFormImage').value = editData.image;
    document.getElementById('galeriFormTitle').value = editData.title || '';
    document.getElementById('galeriFormCategory').value = editData.category || '';
    document.getElementById('galeriFormTall').value = editData.tall ? '1' : '0';
  } else {
    title.textContent = 'Tambah Foto Galeri';
  }

  overlay.classList.add('active');
}

function closeGaleriModal() {
  document.getElementById('galeriModalOverlay').classList.remove('active');
}

// ============================================
// EDIT GALERI - Load data into modal
// ============================================
async function editGaleri(id) {
  const item = allGaleri.find(g => g.id === id);
  if (item) {
    openGaleriModal(item);
  } else {
    showToast('Foto tidak ditemukan', 'error');
  }
}

// ============================================
// FORM GALERI SUBMIT (CREATE / UPDATE)
// ============================================
async function handleGaleriSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('galeriFormId').value;
  const isEdit = !!id;

  const payload = {
    image: document.getElementById('galeriFormImage').value.trim(),
    title: document.getElementById('galeriFormTitle').value.trim(),
    category: document.getElementById('galeriFormCategory').value.trim(),
    tall: parseInt(document.getElementById('galeriFormTall').value) === 1
  };

  if (isEdit) payload.id = parseInt(id);

  try {
    const res = await fetch(API_GALERI, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.success) {
      showToast(isEdit ? 'Foto galeri berhasil diperbarui!' : 'Foto galeri berhasil ditambahkan!', 'success');
      closeGaleriModal();
      loadGaleri();
    } else {
      showToast(json.message || 'Terjadi kesalahan', 'error');
    }
  } catch {
    showToast('Tidak dapat terhubung ke server', 'error');
  }
}

// ============================================
// LOAD PENGATURAN (CONTACT INFO)
// ============================================
async function loadPengaturan() {
  const form = document.getElementById('pengaturanForm');
  // Disable form inputs during loading
  const inputs = form.querySelectorAll('input, textarea, button');
  inputs.forEach(el => el.disabled = true);

  try {
    const res = await fetch(API_PENGATURAN);
    const json = await res.json();

    if (json.success && json.data) {
      document.getElementById('settingAlamat').value = json.data.alamat || '';
      document.getElementById('settingTelepon').value = json.data.telepon || '';
      document.getElementById('settingEmail').value = json.data.email || '';
      document.getElementById('settingWhatsapp').value = json.data.whatsapp || '';
    } else {
      showToast('Gagal memuat pengaturan', 'error');
    }
  } catch {
    showToast('Gagal terhubung ke server pengaturan', 'error');
  } finally {
    inputs.forEach(el => el.disabled = false);
  }
}

// ============================================
// SAVE PENGATURAN SUBMIT (PUT)
// ============================================
async function handlePengaturanSubmit(e) {
  e.preventDefault();

  const payload = {
    alamat: document.getElementById('settingAlamat').value.trim(),
    telepon: document.getElementById('settingTelepon').value.trim(),
    email: document.getElementById('settingEmail').value.trim(),
    whatsapp: document.getElementById('settingWhatsapp').value.trim(),
  };

  try {
    const res = await fetch(API_PENGATURAN, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.success) {
      showToast('Pengaturan footer berhasil disimpan!', 'success');
      loadPengaturan();
    } else {
      showToast(json.message || 'Gagal menyimpan pengaturan', 'error');
    }
  } catch {
    showToast('Tidak dapat terhubung ke server', 'error');
  }
}

// ============================================
// DELETE - Confirm & Execute
// ============================================
let deleteTargetId = null;
let deleteTargetType = null; // 'paket' atau 'galeri'

function confirmDelete(id, name, type) {
  deleteTargetId = id;
  deleteTargetType = type;

  const titleEl = document.getElementById('confirmTitle');
  const textEl = document.getElementById('confirmText');

  if (type === 'paket') {
    titleEl.textContent = 'Hapus Paket?';
    textEl.textContent = `Apakah Anda yakin ingin menghapus paket "${name}"? Tindakan ini tidak bisa dibatalkan.`;
  } else {
    titleEl.textContent = 'Hapus Foto?';
    textEl.textContent = `Apakah Anda yakin ingin menghapus foto "${name}" dari galeri? Tindakan ini tidak bisa dibatalkan.`;
  }

  document.getElementById('confirmOverlay').classList.add('active');
  document.getElementById('confirmDeleteBtn').onclick = () => executeDel();
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('active');
  deleteTargetId = null;
  deleteTargetType = null;
}

async function executeDel() {
  if (!deleteTargetId || !deleteTargetType) return;

  const apiEndpoint = deleteTargetType === 'paket' ? API_PAKET : API_GALERI;

  try {
    const res = await fetch(`${apiEndpoint}?id=${deleteTargetId}`, { method: 'DELETE' });
    const json = await res.json();

    if (json.success) {
      showToast(deleteTargetType === 'paket' ? 'Paket berhasil dihapus!' : 'Foto galeri berhasil dihapus!', 'success');
      if (deleteTargetType === 'paket') {
        loadPakets();
      } else {
        loadGaleri();
      }
    } else {
      showToast(json.message || 'Gagal menghapus', 'error');
    }
  } catch {
    showToast('Tidak dapat terhubung ke server', 'error');
  }

  closeConfirm();
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3200);
}
