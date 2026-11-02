# Chandrathil Residency — Rent Management System

An Apple-inspired, responsive rent and tenant management web application designed specifically for **Chandrathil Residency**, an 8-room rental property.

---

## Key Highlights & Features

### 1. Apple-Inspired Aesthetic
- **Minimalist Palette**: Clean white (`#FFFFFF`) and soft grey (`#F5F5F7`, `#FBFBFD`) surfaces with deep charcoal text (`#1D1D1F`).
- **Refined Typography**: Native Apple SF Pro system font stack, balanced hierarchy, and crisp tracking.
- **Layered Micro-Shadows**: Soft, multi-elevation shadows that provide depth without visual noise.
- **Apple Blue & Status Accents**: Restrained blue accents (`#0071E3`), emerald green for paid status (`#34C759`), amber for pending rent (`#FF9500`), and crimson red for vacating warnings (`#FF3B30`).
- **Smooth Sheets & Modals**: Spring-animated modal dialogs with backdrop blur.

### 2. Rent & Property Summary
- **8 Dedicated Rooms**: Distinct cards for Room 1 through Room 8.
- **Dynamic Calculation**: ₹6,000 per occupied room (vacant rooms automatically contribute ₹0 to due/collected amounts).
- **Live Summary Metrics**:
  - **Rent Collected**: Total ₹ collected for the selected month with percentage progress bar.
  - **Rent Still Due**: Total ₹ outstanding with active room count.
  - **Occupied Rooms**: X / 8 rooms with occupancy rate percentage.
  - **Vacant Rooms**: X / 8 rooms with available leasing status.

### 3. Month-by-Month Tracking
- **Month Switcher**: Seamlessly navigate between months using the **‹ Previous** and **Next ›** arrows or click the month pill to select any date.
- **"This Month" Quick Return**: Jump straight back to the current month in one click.
- **Independent Monthly Records**: Rent payments are tracked individually per month (`YYYY-MM`). Marking a tenant as paid in October does not affect November or September.

### 4. Room & Tenant Management
- **Occupied Cards**:
  - Room Number badge
  - Occupancy pill ("Occupied")
  - Monthly rent amount (₹6,000 / month)
  - Tenant's full name
  - Phone number with tap-to-call link (`tel:+91...`) and quick one-click clipboard copy
  - Custom notes (e.g. deposit paid, work info, vehicle number)
  - Payment status pill: "Paid" (with timestamp & receipt view) or "Rent Due"
  - **Actions**:
    - **Mark as Paid / Undo Payment** (1-click toggle)
    - **WhatsApp Rent Reminder** (pre-formatted polite reminder message for due rent)
    - **Edit Tenant Details**
    - **Mark Vacant** (with Apple-style confirmation step)
- **Vacant Cards**:
  - Distinct subtle dashed Apple border and available-for-rent badge
  - Prominent **Assign Tenant** button

### 5. Data Persistence & Extras
- **Offline-First LocalStorage**: All room assignments and monthly payment logs persist automatically across browser reloads.
- **JSON Backup & Export**: Download a full JSON snapshot of residency records anytime.
- **Demo Data Reset**: Easily restore default showcase records anytime.
- **Printable Receipts**: Clean, branded Chandrathil Residency rent receipt view with one-click print styling.
- **Instant Search & Filter**: Segmented filter for All, Occupied, Vacant, Rent Due, and Paid, plus a fast live search input.

---

## How to Open and Use

Simply open `index.html` in any modern web browser (Safari, Chrome, Firefox, Edge):
- **macOS Finder**: Double-click `index.html` in this folder.
- **From Terminal**:
  ```bash
  open index.html
  ```
- **Mobile**: Transfer or sync to your phone, or host on GitHub Pages / Netlify / Vercel with zero setup.
