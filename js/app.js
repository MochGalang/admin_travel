/**
 * Marco Travel - Admin Panel JavaScript
 * CRUD Operations via Fetch API
 */

const API_URL = '../api/paket.php';
let allPakets = [];

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  loadPakets();
});

// ============================================
// LOAD DATA
// ============================================
async function loadPakets() {
  const container = document.getElementById('tableContainer');
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    const res = await fetch(API_URL);
    const json = await res.json();

    if (json.success) {
      allPakets = json.data;
      renderStats();
      renderTable(allPakets);
    } else {
      container.innerHTML = '<div class="empty-state"><h3>Gagal memuat data</h3><p>' + json.message + '</p></div>';
    }
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Tidak dapat terhubung ke server</h3><p>Pastikan XAMPP dan MySQL sudah berjalan, lalu refresh halaman ini.</p></div>';
  }
}

// ============================================
// RENDER STATS
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
// RENDER TABLE
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
          <button class="btn-icon delete" title="Hapus" onclick="confirmDelete(${p.id}, '${p.nama.replace(/'/g, "\\'")}')">
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
// SEARCH / FILTER
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
// MODAL - OPEN / CLOSE
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
// EDIT - Load data into modal
// ============================================
async function editPaket(id) {
  try {
    const res = await fetch(`${API_URL}?id=${id}`);
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
// FORM SUBMIT (CREATE / UPDATE)
// ============================================
async function handleSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('formId').value;
  const isEdit = !!id;

  // Collect text areas → arrays
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
    highlight: parseInt(document.getElementById('formHighlight').value),
    wa: document.getElementById('formWa').value.trim(),
    deskripsi: document.getElementById('formDeskripsi').value.trim(),
    fasilitas: toArray(document.getElementById('formFasilitas').value),
    itinerary: toArray(document.getElementById('formItinerary').value),
    includes: toArray(document.getElementById('formIncludes').value),
    excludes: toArray(document.getElementById('formExcludes').value),
  };

  if (isEdit) payload.id = parseInt(id);

  try {
    const res = await fetch(API_URL, {
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
// DELETE - Confirm & Execute
// ============================================
let deleteTargetId = null;

function confirmDelete(id, nama) {
  deleteTargetId = id;
  document.getElementById('confirmText').textContent = `Apakah Anda yakin ingin menghapus paket "${nama}"? Tindakan ini tidak bisa dibatalkan.`;
  document.getElementById('confirmOverlay').classList.add('active');

  document.getElementById('confirmDeleteBtn').onclick = () => executeDel();
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('active');
  deleteTargetId = null;
}

async function executeDel() {
  if (!deleteTargetId) return;

  try {
    const res = await fetch(`${API_URL}?id=${deleteTargetId}`, { method: 'DELETE' });
    const json = await res.json();

    if (json.success) {
      showToast('Paket berhasil dihapus!', 'success');
      loadPakets();
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
