/**
 * Chandrathil Residency - Rent Management System
 * High-performance, offline-first client application with Apple-style UX.
 */

// Key configuration
const STORAGE_KEYS = {
  ROOMS: 'chandrathil_residency_rooms_v2',
  PAYMENTS: 'chandrathil_residency_payments_v2',
  CURRENT_MONTH: 'chandrathil_residency_active_month'
};

const DEFAULT_RENT_PER_ROOM = 6000;
const TOTAL_ROOM_COUNT = 13;

// Initial seed data to make the residency instantly functional on first launch (Rooms 101–113)
const INITIAL_ROOMS = [
  {
    id: 101,
    occupied: true,
    tenant: {
      name: "Rahul Sharma",
      phone: "+91 98471 23456",
      notes: "Software engineer at Infopark. Moved in Jan 2026. Deposit ₹12,000 paid.",
      moveInDate: "2026-01-15",
      rent: 6000
    }
  },
  {
    id: 102,
    occupied: true,
    tenant: {
      name: "Dr. Ananya Nair",
      phone: "+91 97452 89012",
      notes: "Resident doctor at Amrita Hospital. Prefers communication after 6 PM.",
      moveInDate: "2026-02-01",
      rent: 6000
    }
  },
  {
    id: 103,
    occupied: true,
    tenant: {
      name: "Muhammed Faizal",
      phone: "+91 94460 11223",
      notes: "Digital marketer. Has two-wheeler parked in spot #103.",
      moveInDate: "2026-03-10",
      rent: 6000
    }
  },
  {
    id: 104,
    occupied: false,
    tenant: null
  },
  {
    id: 105,
    occupied: true,
    tenant: {
      name: "Arjun Menon",
      phone: "+91 98950 33445",
      notes: "College lecturer. Very prompt with monthly rent payments.",
      moveInDate: "2025-11-01",
      rent: 6000
    }
  },
  {
    id: 106,
    occupied: true,
    tenant: {
      name: "Sneha George",
      phone: "+91 96332 55667",
      notes: "Architect. Needs digital receipt for corporate HRA filing.",
      moveInDate: "2026-04-05",
      rent: 6000
    }
  },
  {
    id: 107,
    occupied: true,
    tenant: {
      name: "Vipin Das",
      phone: "+91 99478 77889",
      notes: "Senior clerk at SBI. Paid 3 months advance rent in cash.",
      moveInDate: "2025-08-20",
      rent: 6000
    }
  },
  {
    id: 108,
    occupied: false,
    tenant: null
  },
  {
    id: 109,
    occupied: false,
    tenant: null
  },
  {
    id: 110,
    occupied: false,
    tenant: null
  },
  {
    id: 111,
    occupied: false,
    tenant: null
  },
  {
    id: 112,
    occupied: false,
    tenant: null
  },
  {
    id: 113,
    occupied: false,
    tenant: null
  }
];

// Application State
const AppState = {
  currentDate: new Date(), // Active selected month & year
  rooms: [],
  payments: {}, // structure: { "YYYY-MM": { [roomId]: { paid: boolean, paidAt: string, method: string, amount: number } } }
  activeFilter: 'all', // all, occupied, vacant, due, paid
  searchQuery: '',
  targetRoomForAction: null // Holds room object when modal opens
};

// ==========================================================================
// Initialization & LocalStorage Management
// ==========================================================================

function initApp() {
  loadData();
  setupEventListeners();
  renderMonthNavigator();
  renderSummary();
  renderRooms();
}

function loadData() {
  // Load or set rooms
  try {
    const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (storedRooms) {
      AppState.rooms = JSON.parse(storedRooms);
      // Ensure all 13 rooms exist and use 101-113 numbering
      const hasLegacyRooms = AppState.rooms.some(r => r.id >= 1 && r.id <= 8);
      if (!Array.isArray(AppState.rooms) || AppState.rooms.length !== TOTAL_ROOM_COUNT || hasLegacyRooms) {
        AppState.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
        saveRooms();
      }
    } else {
      AppState.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
      saveRooms();
    }
  } catch (e) {
    console.error("Error loading rooms from storage:", e);
    AppState.rooms = JSON.parse(JSON.stringify(INITIAL_ROOMS));
  }

  // Load or set payments
  try {
    const storedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (storedPayments) {
      AppState.payments = JSON.parse(storedPayments);
    } else {
      // Create initial seed payment statuses for current month (Rooms 101–113)
      const currentMonthKey = getMonthKey(AppState.currentDate);
      AppState.payments = {
        [currentMonthKey]: {
          101: { paid: true, paidAt: new Date(2026, 9, 3, 10, 30).toISOString(), method: 'UPI (GPay)', amount: 6000 },
          102: { paid: true, paidAt: new Date(2026, 9, 4, 15, 12).toISOString(), method: 'Bank Transfer', amount: 6000 },
          103: { paid: false, paidAt: null, method: null, amount: 6000 },
          105: { paid: true, paidAt: new Date(2026, 9, 5, 9, 0).toISOString(), method: 'UPI (PhonePe)', amount: 6000 },
          106: { paid: false, paidAt: null, method: null, amount: 6000 },
          107: { paid: true, paidAt: new Date(2026, 9, 2, 11, 45).toISOString(), method: 'Cash', amount: 6000 }
        }
      };
      savePayments();
    }
  } catch (e) {
    console.error("Error loading payments from storage:", e);
    AppState.payments = {};
  }
}

function saveRooms() {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(AppState.rooms));
}

function savePayments() {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(AppState.payments));
}

// Helper: Format Date to YYYY-MM key
function getMonthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// Helper: Format month for display (e.g., "October 2026")
function getMonthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Helper: Format Indian Rupee currency
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// ==========================================================================
// Month Switcher Controls
// ==========================================================================

function changeMonth(delta) {
  AppState.currentDate = new Date(
    AppState.currentDate.getFullYear(),
    AppState.currentDate.getMonth() + delta,
    1
  );
  renderMonthNavigator();
  renderSummary();
  renderRooms();
  showToast(`Switched to ${getMonthLabel(AppState.currentDate)}`);
}

function resetToCurrentMonth() {
  AppState.currentDate = new Date();
  renderMonthNavigator();
  renderSummary();
  renderRooms();
  showToast(`Jumped to current month`);
}

function setMonthFromPicker(year, monthIndex) {
  AppState.currentDate = new Date(year, monthIndex, 1);
  renderMonthNavigator();
  renderSummary();
  renderRooms();
  showToast(`Viewing ${getMonthLabel(AppState.currentDate)}`);
}

function renderMonthNavigator() {
  const labelEl = document.getElementById('currentMonthDisplayLabel');
  const monthContextLabel = document.getElementById('summaryMonthContext');
  const label = getMonthLabel(AppState.currentDate);
  const monthKey = getMonthKey(AppState.currentDate);
  
  if (labelEl) labelEl.textContent = label;
  if (monthContextLabel) monthContextLabel.textContent = `for ${label}`;

  const hiddenInput = document.getElementById('hiddenMonthInput');
  if (hiddenInput) {
    hiddenInput.value = monthKey;
  }
}

// ==========================================================================
// Summary Dashboard Calculations
// ==========================================================================

function renderSummary() {
  const monthKey = getMonthKey(AppState.currentDate);
  const monthPayments = AppState.payments[monthKey] || {};

  let occupiedCount = 0;
  let vacantCount = 0;
  let totalRentCollected = 0;
  let totalRentDue = 0;

  AppState.rooms.forEach(room => {
    if (room.occupied && room.tenant) {
      occupiedCount++;
      const rentAmount = Number(room.tenant.rent) || DEFAULT_RENT_PER_ROOM;
      const isPaid = monthPayments[room.id]?.paid === true;

      if (isPaid) {
        totalRentCollected += rentAmount;
      } else {
        totalRentDue += rentAmount;
      }
    } else {
      vacantCount++;
    }
  });

  const totalExpectedRent = totalRentCollected + totalRentDue;
  const collectionRate = totalExpectedRent > 0 
    ? Math.round((totalRentCollected / totalExpectedRent) * 100) 
    : 0;

  // Update DOM metrics
  document.getElementById('metricCollected').textContent = formatINR(totalRentCollected);
  document.getElementById('metricCollectedSub').textContent = `${collectionRate}% of ₹${(totalExpectedRent).toLocaleString('en-IN')}`;
  
  const collectedProgress = document.getElementById('metricCollectedProgress');
  if (collectedProgress) collectedProgress.style.width = `${collectionRate}%`;

  document.getElementById('metricDue').textContent = formatINR(totalRentDue);
  const dueRoomCount = AppState.rooms.filter(r => r.occupied && !monthPayments[r.id]?.paid).length;
  document.getElementById('metricDueSub').textContent = `${dueRoomCount} room${dueRoomCount === 1 ? '' : 's'} pending payment`;

  document.getElementById('metricOccupied').textContent = `${occupiedCount} / ${TOTAL_ROOM_COUNT}`;
  const occupancyRate = Math.round((occupiedCount / TOTAL_ROOM_COUNT) * 100);
  document.getElementById('metricOccupiedSub').textContent = `${occupancyRate}% occupancy rate`;

  document.getElementById('metricVacant').textContent = `${vacantCount} / ${TOTAL_ROOM_COUNT}`;
  document.getElementById('metricVacantSub').textContent = vacantCount > 0 ? `${vacantCount} room${vacantCount === 1 ? '' : 's'} available` : 'Full capacity';

  // Update counts in filter segments
  const paidCount = AppState.rooms.filter(r => r.occupied && monthPayments[r.id]?.paid).length;
  updateFilterCounts({
    all: TOTAL_ROOM_COUNT,
    occupied: occupiedCount,
    vacant: vacantCount,
    due: dueRoomCount,
    paid: paidCount
  });
}

function updateFilterCounts(counts) {
  const cAll = document.getElementById('countAll');
  const cOccupied = document.getElementById('countOccupied');
  const cVacant = document.getElementById('countVacant');
  const cDue = document.getElementById('countDue');
  const cPaid = document.getElementById('countPaid');

  if (cAll) cAll.textContent = counts.all;
  if (cOccupied) cOccupied.textContent = counts.occupied;
  if (cVacant) cVacant.textContent = counts.vacant;
  if (cDue) cDue.textContent = counts.due;
  if (cPaid) cPaid.textContent = counts.paid;
}

// ==========================================================================
// Room Cards Grid Rendering
// ==========================================================================

function renderRooms() {
  const container = document.getElementById('roomsGridContainer');
  if (!container) return;

  const monthKey = getMonthKey(AppState.currentDate);
  const monthPayments = AppState.payments[monthKey] || {};
  const currentMonthName = getMonthLabel(AppState.currentDate);

  // Filter & Search logic
  const filteredRooms = AppState.rooms.filter(room => {
    const isPaid = monthPayments[room.id]?.paid === true;

    // Filter segment check
    if (AppState.activeFilter === 'occupied' && !room.occupied) return false;
    if (AppState.activeFilter === 'vacant' && room.occupied) return false;
    if (AppState.activeFilter === 'due' && (!room.occupied || isPaid)) return false;
    if (AppState.activeFilter === 'paid' && (!room.occupied || !isPaid)) return false;

    // Search query check
    if (AppState.searchQuery.trim() !== '') {
      const q = AppState.searchQuery.toLowerCase().trim();
      const matchRoom = `room ${room.id}`.includes(q) || String(room.id) === q;
      const matchTenant = room.occupied && room.tenant?.name?.toLowerCase().includes(q);
      const matchPhone = room.occupied && room.tenant?.phone?.toLowerCase().includes(q);
      const matchNotes = room.occupied && room.tenant?.notes?.toLowerCase().includes(q);
      if (!matchRoom && !matchTenant && !matchPhone && !matchNotes) return false;
    }

    return true;
  });

  // Empty state if filtered results are 0
  if (filteredRooms.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; background: #FFFFFF; border-radius: var(--radius-xl); padding: 48px 24px; text-align: center; border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
        <div style="width: 56px; height: 56px; background: #F2F2F7; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">No rooms match criteria</h3>
        <p style="font-size: 0.84rem; color: var(--text-secondary); max-width: 320px; margin: 0 auto 16px;">Try adjusting your active filter or search keywords.</p>
        <button class="btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  // Render cards
  container.innerHTML = filteredRooms.map(room => {
    if (room.occupied && room.tenant) {
      return renderOccupiedCard(room, monthPayments[room.id], currentMonthName);
    } else {
      return renderVacantCard(room);
    }
  }).join('');
}

// Render individual occupied room card
function renderOccupiedCard(room, paymentRecord, currentMonthName) {
  const isPaid = paymentRecord?.paid === true;
  const rent = room.tenant.rent || DEFAULT_RENT_PER_ROOM;
  const formattedRent = formatINR(rent);
  
  // Format clean phone number for display & tel link
  const rawPhone = room.tenant.phone || '';
  const cleanPhone = rawPhone.replace(/\s+/g, '');
  const hasPhone = cleanPhone.length > 0;

  // Format payment date
  let paidDateText = '';
  if (isPaid && paymentRecord.paidAt) {
    const d = new Date(paymentRecord.paidAt);
    paidDateText = `Paid on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • ${paymentRecord.method || 'Online'}`;
  }

  // WhatsApp reminder message text
  const waMsg = encodeURIComponent(
    `Hello ${room.tenant.name}, this is a gentle reminder regarding the rent for Room ${room.id} at Chandrathil Residency for ${currentMonthName}. Monthly rent amount is ₹${rent.toLocaleString('en-IN')}. Please ignore if already transferred. Thank you!`
  );

  return `
    <div class="room-card status-occupied ${isPaid ? 'paid' : 'due'}" id="room-card-${room.id}" onclick="handleCardClick(event, ${room.id})">
      <div class="card-top-row">
        <div class="room-badge">
          <span>Room</span>
          <span class="room-badge-number">${room.id}</span>
        </div>
        <span class="occupancy-pill occupied">
          <span class="status-dot"></span>
          <span class="pill-text">Occupied</span>
        </span>
      </div>

      <div class="room-rent-tag">
        <span class="rent-currency">${formattedRent}</span>
        <span class="rent-period">/ month</span>
      </div>

      <div class="tenant-info-block">
        <div class="tenant-name-row">
          <h3 class="tenant-name">${escapeHTML(room.tenant.name)}</h3>
        </div>

        <div class="tenant-phone-row">
          ${hasPhone ? `
            <a href="tel:${cleanPhone}" class="phone-link" title="Tap to call ${escapeHTML(room.tenant.name)}" onclick="event.stopPropagation()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>${escapeHTML(rawPhone)}</span>
            </a>
            <button class="copy-phone-btn" onclick="event.stopPropagation(); copyToClipboard('${cleanPhone}', 'Phone number copied!')" title="Copy phone number">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          ` : `
            <span style="font-size: 0.78rem; color: var(--text-tertiary);">No phone number</span>
          `}
        </div>

        <div class="tenant-notes ${room.tenant.notes ? '' : 'empty'}">
          ${room.tenant.notes ? escapeHTML(room.tenant.notes) : 'No additional notes'}
        </div>
      </div>

      <!-- Selected Month Payment Status -->
      <div class="payment-status-block ${isPaid ? 'paid' : 'due'}">
        <div class="payment-status-header">
          <span class="payment-status-title">${currentMonthName}</span>
          <span class="payment-badge ${isPaid ? 'paid' : 'due'}">
            ${isPaid ? `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              Paid
            ` : `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Rent Due
            `}
          </span>
        </div>
        <div class="payment-date-info">
          <span>${isPaid ? paidDateText : `Due: ${formattedRent}`}</span>
          ${isPaid ? `
            <button onclick="event.stopPropagation(); openReceiptModal(${room.id})" style="font-size: 0.72rem; color: var(--accent-blue); text-decoration: underline; font-weight: 500;">
              Receipt
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions-row">
        ${isPaid ? `
          <button class="btn-primary-payment undo-paid" onclick="event.stopPropagation(); togglePayment(${room.id}, false)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            Undo
          </button>
        ` : `
          <button class="btn-primary-payment mark-paid" onclick="event.stopPropagation(); togglePayment(${room.id}, true)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Mark Paid
          </button>
          ${hasPhone ? `
            <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="whatsapp-reminder-btn" onclick="event.stopPropagation()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 2C6.496 2 2 6.494 2 12.029c0 1.956.564 3.784 1.545 5.334L2 22l4.821-1.508a9.98 9.98 0 0 0 5.21 1.455h.004c5.534 0 10.03-4.495 10.03-10.03 0-2.68-1.045-5.2-2.943-7.098A9.97 9.97 0 0 0 12.031 2zm5.82 14.398c-.244.686-1.42 1.309-1.953 1.353-.534.043-1.043.208-3.486-.795-2.936-1.206-4.81-4.22-4.956-4.417-.145-.198-1.189-1.583-1.189-3.02 0-1.436.75-2.143 1.018-2.435.268-.292.585-.365.78-.365.195 0 .39.002.56.01.183.009.427-.07.668.51.244.584.83 2.027.903 2.173.073.146.122.316.024.511-.098.195-.147.317-.293.488-.146.17-.308.38-.44.51-.146.147-.3.308-.129.601.17.293.758 1.25 1.625 2.021 1.116.993 2.057 1.3 2.35 1.446.292.146.463.122.634-.073.17-.195.732-.852.927-1.144.195-.293.39-.244.658-.147.268.098 1.708.805 2.001.952.293.146.488.219.561.341.073.122.073.707-.171 1.393z"/></svg>
              Send WhatsApp Reminder
            </a>
          ` : ''}
        `}

        <div class="card-secondary-actions">
          <button class="btn-subtle" onclick="event.stopPropagation(); openTenantModal(${room.id}, true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit Tenant
          </button>
          <button class="btn-subtle vacate-btn" onclick="event.stopPropagation(); promptMarkVacant(${room.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Mark Vacant
          </button>
        </div>

        <span class="mobile-tap-card-indicator">Details ↗</span>
      </div>
    </div>
  `;
}

// Render individual vacant room card
function renderVacantCard(room) {
  return `
    <div class="room-card status-vacant" id="room-card-${room.id}" onclick="handleCardClick(event, ${room.id})">
      <div class="card-top-row">
        <div class="room-badge">
          <span>Room</span>
          <span class="room-badge-number">${room.id}</span>
        </div>
        <span class="occupancy-pill vacant">
          <span class="status-dot"></span>
          <span class="pill-text">Vacant</span>
        </span>
      </div>

      <div class="room-rent-tag">
        <span class="rent-currency">${formatINR(DEFAULT_RENT_PER_ROOM)}</span>
        <span class="rent-period">/ mo (Std)</span>
      </div>

      <div class="vacant-body">
        <div class="vacant-icon-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <h4 class="vacant-title">Vacant</h4>
        <p class="vacant-desc">Ready for leasing</p>
        
        <button class="btn-assign-tenant" onclick="event.stopPropagation(); openTenantModal(${room.id}, false)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Assign
        </button>

        <span class="mobile-tap-card-indicator">Tap to assign</span>
      </div>
    </div>
  `;
}

// ==========================================================================
// Mobile 3-Row Tap Handling & Room Detail Sheet
// ==========================================================================

function handleCardClick(e, roomId) {
  // If user clicked directly on a button or link, do not trigger the card sheet
  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
    return;
  }
  
  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room) return;

  if (!room.occupied) {
    openTenantModal(roomId, false);
  } else {
    openRoomDetailSheet(roomId);
  }
}

function openRoomDetailSheet(roomId) {
  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room || !room.occupied) return;

  const monthKey = getMonthKey(AppState.currentDate);
  const paymentRecord = AppState.payments[monthKey]?.[roomId];
  const isPaid = paymentRecord?.paid === true;
  const currentMonthName = getMonthLabel(AppState.currentDate);
  const rent = room.tenant.rent || DEFAULT_RENT_PER_ROOM;

  const rawPhone = room.tenant.phone || '';
  const cleanPhone = rawPhone.replace(/\s+/g, '');
  const hasPhone = cleanPhone.length > 0;

  const waMsg = encodeURIComponent(
    `Hello ${room.tenant.name}, gentle reminder regarding rent for Room ${room.id} at Chandrathil Residency for ${currentMonthName} (₹${rent.toLocaleString('en-IN')}). Thank you!`
  );

  let paidText = 'Rent is currently pending';
  if (isPaid && paymentRecord.paidAt) {
    const d = new Date(paymentRecord.paidAt);
    paidText = `Paid on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} via ${paymentRecord.method || 'Online'}`;
  }

  const sheet = document.getElementById('roomDetailSheetContent');
  if (sheet) {
    sheet.innerHTML = `
      <div class="room-detail-sheet-body">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div class="room-badge" style="font-size: 0.95rem; padding: 4px 12px;">
            <span>Room</span>
            <span class="room-badge-number">${room.id}</span>
          </div>
          <span class="occupancy-pill occupied" style="font-size: 0.78rem; padding: 4px 10px;">
            <span class="status-dot"></span>
            Occupied
          </span>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">
            ${escapeHTML(room.tenant.name)}
          </h2>
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 3px;">
            Monthly Rent: <strong style="color: var(--text-primary); font-size: 0.95rem;">${formatINR(rent)}</strong>
            ${room.tenant.moveInDate ? ` • Since ${new Date(room.tenant.moveInDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ''}
          </div>
        </div>

        <!-- Phone & Quick Contact Actions -->
        ${hasPhone ? `
          <div style="background: #F7F7F9; border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Contact Phone</div>
              <a href="tel:${cleanPhone}" class="phone-link" style="font-size: 0.95rem; font-weight: 600;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>${escapeHTML(rawPhone)}</span>
              </a>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="tel:${cleanPhone}" class="btn-subtle" style="padding: 6px 10px; font-weight: 600; color: var(--accent-blue);" title="Call">
                Call
              </a>
              <button class="btn-subtle" onclick="copyToClipboard('${cleanPhone}', 'Phone copied!')" title="Copy">
                Copy
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Payment Status Card -->
        <div class="payment-status-block ${isPaid ? 'paid' : 'due'}" style="margin-bottom: 18px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">Rent for ${currentMonthName}</span>
            <span class="payment-badge ${isPaid ? 'paid' : 'due'}">
              ${isPaid ? '✓ Paid' : '● Due'}
            </span>
          </div>
          <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 10px;">
            ${paidText}
          </div>
          <div style="display: flex; gap: 8px;">
            ${isPaid ? `
              <button class="btn-primary-payment undo-paid" style="flex: 1;" onclick="togglePayment(${room.id}, false); openRoomDetailSheet(${room.id});">
                Undo Payment
              </button>
              <button class="btn-subtle" onclick="closeModal('roomDetailModal'); openReceiptModal(${room.id});">
                View Receipt
              </button>
            ` : `
              <button class="btn-primary-payment mark-paid" style="flex: 1;" onclick="togglePayment(${room.id}, true); openRoomDetailSheet(${room.id});">
                Mark as Paid (₹${rent.toLocaleString('en-IN')})
              </button>
              ${hasPhone ? `
                <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="whatsapp-reminder-btn" style="margin-top: 0;">
                  WhatsApp
                </a>
              ` : ''}
            `}
          </div>
        </div>

        <!-- Notes -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px;">Notes</div>
          <div style="background: #F7F7F9; border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; border-left: 3px solid var(--border-medium);">
            ${room.tenant.notes ? escapeHTML(room.tenant.notes) : '<em style="color: var(--text-tertiary);">No notes registered for this occupant.</em>'}
          </div>
        </div>

        <!-- Secondary Actions -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border-light);">
          <button class="btn-secondary" onclick="closeModal('roomDetailModal'); openTenantModal(${room.id}, true);">
            Edit Tenant
          </button>
          <button class="btn-danger" onclick="closeModal('roomDetailModal'); promptMarkVacant(${room.id});">
            Mark Vacant
          </button>
        </div>
      </div>
    `;
  }

  openModal('roomDetailModal');
}

// Toggle mobile view between 2-column grid and 1-column list
function toggleMobileGrid() {
  const container = document.getElementById('roomsGridContainer');
  const toggleText = document.getElementById('mobileViewToggleText');
  if (!container) return;

  const isCurrentlyList = container.classList.contains('view-list');
  if (isCurrentlyList) {
    container.classList.remove('view-list');
    if (toggleText) toggleText.textContent = 'Grid';
    showToast('Switched to Grid View');
  } else {
    container.classList.add('view-list');
    if (toggleText) toggleText.textContent = 'List';
    showToast('Switched to 1-Column List View');
  }
}

// ==========================================================================
// Payment Actions (Mark as Paid / Undo)
// ==========================================================================

function togglePayment(roomId, setPaid) {
  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room || !room.occupied) {
    showToast('Cannot set payment for a vacant room.');
    return;
  }

  const monthKey = getMonthKey(AppState.currentDate);
  if (!AppState.payments[monthKey]) {
    AppState.payments[monthKey] = {};
  }

  if (setPaid) {
    AppState.payments[monthKey][roomId] = {
      paid: true,
      paidAt: new Date().toISOString(),
      method: 'UPI / Direct',
      amount: room.tenant.rent || DEFAULT_RENT_PER_ROOM
    };
    showToast(`Room ${roomId} marked as Paid for ${getMonthLabel(AppState.currentDate)}`);
  } else {
    AppState.payments[monthKey][roomId] = {
      paid: false,
      paidAt: null,
      method: null,
      amount: room.tenant.rent || DEFAULT_RENT_PER_ROOM
    };
    showToast(`Payment undone for Room ${roomId}`);
  }

  savePayments();
  renderSummary();
  renderRooms();
}

// ==========================================================================
// Tenant Management: Add, Edit, Vacate
// ==========================================================================

function openTenantModal(roomId, isEditing) {
  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room) return;

  AppState.targetRoomForAction = room;

  const modalTitle = document.getElementById('tenantModalTitle');
  const modalSub = document.getElementById('tenantModalSub');
  const form = document.getElementById('tenantForm');

  if (isEditing) {
    modalTitle.textContent = `Edit Tenant — Room ${roomId}`;
    modalSub.textContent = `Update details for ${room.tenant?.name || 'occupant'}`;
    document.getElementById('tenantNameInput').value = room.tenant?.name || '';
    document.getElementById('tenantPhoneInput').value = room.tenant?.phone || '';
    document.getElementById('tenantRentInput').value = room.tenant?.rent || DEFAULT_RENT_PER_ROOM;
    document.getElementById('tenantNotesInput').value = room.tenant?.notes || '';
    document.getElementById('tenantMoveInInput').value = room.tenant?.moveInDate || '';
  } else {
    // Assigning to vacant room
    modalTitle.textContent = `Assign Tenant — Room ${roomId}`;
    modalSub.textContent = `Register a new occupant for Chandrathil Residency`;
    form.reset();
    document.getElementById('tenantRentInput').value = DEFAULT_RENT_PER_ROOM;
    document.getElementById('tenantMoveInInput').value = new Date().toISOString().split('T')[0];
  }

  document.getElementById('targetRoomIdInput').value = roomId;
  openModal('tenantModal');
}

function handleTenantFormSubmit(e) {
  e.preventDefault();
  const roomId = parseInt(document.getElementById('targetRoomIdInput').value, 10);
  const name = document.getElementById('tenantNameInput').value.trim();
  const phone = document.getElementById('tenantPhoneInput').value.trim();
  const rent = parseInt(document.getElementById('tenantRentInput').value, 10) || DEFAULT_RENT_PER_ROOM;
  const notes = document.getElementById('tenantNotesInput').value.trim();
  const moveInDate = document.getElementById('tenantMoveInInput').value;

  if (!name) {
    alert('Please enter tenant full name.');
    return;
  }

  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room) return;

  const isNewAssignment = !room.occupied;

  room.occupied = true;
  room.tenant = {
    name,
    phone,
    rent,
    notes,
    moveInDate
  };

  // If new assignment, ensure month payment state is initialized to due
  const monthKey = getMonthKey(AppState.currentDate);
  if (!AppState.payments[monthKey]) AppState.payments[monthKey] = {};
  if (!AppState.payments[monthKey][roomId]) {
    AppState.payments[monthKey][roomId] = { paid: false, paidAt: null, method: null, amount: rent };
  }

  saveRooms();
  savePayments();
  closeModal('tenantModal');
  renderSummary();
  renderRooms();

  showToast(isNewAssignment ? `Tenant assigned to Room ${roomId}` : `Room ${roomId} details updated`);
}

// Vacating room with confirmed dialog
function promptMarkVacant(roomId) {
  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room || !room.occupied) return;

  AppState.targetRoomForAction = room;
  document.getElementById('vacateRoomNumber').textContent = room.id;
  document.getElementById('vacateTenantName').textContent = room.tenant?.name || 'the tenant';
  
  openModal('vacateConfirmModal');
}

function confirmMarkVacant() {
  if (!AppState.targetRoomForAction) return;
  const room = AppState.targetRoomForAction;

  const prevName = room.tenant?.name || 'Tenant';
  room.occupied = false;
  room.tenant = null;

  saveRooms();
  closeModal('vacateConfirmModal');
  renderSummary();
  renderRooms();

  showToast(`Room ${room.id} marked as vacant. ${prevName} removed.`);
  AppState.targetRoomForAction = null;
}

// ==========================================================================
// Rent Receipt Modal Preview
// ==========================================================================

function openReceiptModal(roomId) {
  const room = AppState.rooms.find(r => r.id === roomId);
  if (!room || !room.occupied) return;

  const monthKey = getMonthKey(AppState.currentDate);
  const payment = AppState.payments[monthKey]?.[roomId];
  const monthLabel = getMonthLabel(AppState.currentDate);
  const rent = room.tenant.rent || DEFAULT_RENT_PER_ROOM;

  const receiptContent = document.getElementById('receiptModalContent');
  const dateFormatted = payment?.paidAt 
    ? new Date(payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');

  receiptContent.innerHTML = `
    <div class="receipt-card">
      <div class="receipt-header">
        <div style="font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-blue); font-weight: 700; margin-bottom: 2px;">Official Rent Receipt</div>
        <div class="receipt-title">CHANDRATHIL RESIDENCY</div>
        <div class="receipt-sub">Edappally, Kochi, Kerala • 13-Room Rental Property (Rooms 101–113)</div>
        <div style="margin-top: 8px; font-size: 0.76rem; color: var(--text-tertiary);">Receipt Ref: CR-${monthKey.replace('-', '')}-R${room.id}</div>
      </div>

      <div class="receipt-row">
        <span style="color: var(--text-secondary);">Tenant Name:</span>
        <span style="font-weight: 600;">${escapeHTML(room.tenant.name)}</span>
      </div>
      <div class="receipt-row">
        <span style="color: var(--text-secondary);">Room Assigned:</span>
        <span style="font-weight: 600;">Room No. ${room.id}</span>
      </div>
      <div class="receipt-row">
        <span style="color: var(--text-secondary);">Rental Period:</span>
        <span style="font-weight: 600;">${monthLabel}</span>
      </div>
      <div class="receipt-row">
        <span style="color: var(--text-secondary);">Payment Date:</span>
        <span>${dateFormatted}</span>
      </div>
      <div class="receipt-row">
        <span style="color: var(--text-secondary);">Payment Mode:</span>
        <span>${payment?.method || 'UPI / Online'}</span>
      </div>

      <div class="receipt-row bold">
        <span>Total Rent Paid:</span>
        <span style="color: var(--accent-green-text);">${formatINR(rent)}</span>
      </div>

      <div style="margin-top: 18px; padding-top: 12px; border-top: 1px dashed var(--border-light); display: flex; align-items: center; justify-content: space-between; font-size: 0.74rem; color: var(--text-secondary);">
        <span style="display: inline-flex; align-items: center; gap: 4px; color: var(--accent-green-text); font-weight: 600;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          PAYMENT VERIFIED
        </span>
        <span>Chandrathil Residency Management</span>
      </div>
    </div>
  `;

  openModal('receiptModal');
}

function printReceipt() {
  window.print();
}

// ==========================================================================
// Modal Utilities
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal if user clicks on backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Close modal on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// ==========================================================================
// Filters & Search
// ==========================================================================

function setFilter(filterType) {
  AppState.activeFilter = filterType;
  
  document.querySelectorAll('.segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });

  renderRooms();
}

function handleSearch(e) {
  AppState.searchQuery = e.target.value;
  renderRooms();
}

function resetFilters() {
  AppState.activeFilter = 'all';
  AppState.searchQuery = '';
  
  const searchInput = document.getElementById('roomSearchInput');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.segment-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
  });

  renderRooms();
}

// ==========================================================================
// Backup & Reset Functionality
// ==========================================================================

function exportDataBackup() {
  const data = {
    property: "Chandrathil Residency",
    exportedAt: new Date().toISOString(),
    rooms: AppState.rooms,
    payments: AppState.payments
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chandrathil-residency-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Residency data backup exported');
}

function resetToDefaultSeed() {
  if (confirm("Reset to default demonstration data? This will restore rooms 101 to 113 (6 occupied, 7 vacant).")) {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    loadData();
    renderSummary();
    renderRooms();
    showToast('Demo data restored successfully');
  }
}

// ==========================================================================
// UI Helper Utilities: Clipboard, Toast, HTML Escape
// ==========================================================================

function copyToClipboard(text, msg = 'Copied to clipboard!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg);
    });
  } else {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(msg);
  }
}

function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// Setup Listeners
// ==========================================================================

function setupEventListeners() {
  // Month arrow buttons & picker
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const todayBtn = document.getElementById('todayMonthBtn');
  const currentMonthBtn = document.getElementById('currentMonthBtn');
  const hiddenMonthInput = document.getElementById('hiddenMonthInput');

  if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
  if (todayBtn) todayBtn.addEventListener('click', resetToCurrentMonth);

  if (currentMonthBtn && hiddenMonthInput) {
    currentMonthBtn.addEventListener('click', () => {
      try {
        if (typeof hiddenMonthInput.showPicker === 'function') {
          hiddenMonthInput.showPicker();
        } else {
          hiddenMonthInput.click();
        }
      } catch (err) {
        hiddenMonthInput.click();
      }
    });

    hiddenMonthInput.addEventListener('change', (e) => {
      if (e.target.value) {
        const [yearStr, monthStr] = e.target.value.split('-');
        const year = parseInt(yearStr, 10);
        const monthIndex = parseInt(monthStr, 10) - 1;
        setMonthFromPicker(year, monthIndex);
      }
    });
  }

  // Filter segment buttons
  document.querySelectorAll('.segment-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Search input
  const searchInput = document.getElementById('roomSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Tenant form
  const tenantForm = document.getElementById('tenantForm');
  if (tenantForm) {
    tenantForm.addEventListener('submit', handleTenantFormSubmit);
  }

  // Vacate confirm button
  const confirmVacateBtn = document.getElementById('confirmVacateBtn');
  if (confirmVacateBtn) {
    confirmVacateBtn.addEventListener('click', confirmMarkVacant);
  }
}

// Kick off when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
