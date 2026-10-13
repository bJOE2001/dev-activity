# UI Design System — Dev Activity (Ateb Venue)

This document outlines the design tokens, component standards, typography, and visual patterns implemented across the Ateb Venue Sales & Inventory application, matching the Figma frames 1:1.

---

## 1. Visual Hierarchy & Theme

- **Theme**: Enterprise Clean Light Mode with Ateb Venue Navy branding.
- **Font Stack**: Inter / Geist Sans system font stack for crisp readability and numeric alignment.
- **Surface & Background Colors**:
  - App Background: `#F8FAFC` (Tailwind `slate-50`)
  - Card & Container Surface: `#FFFFFF` (White)
  - Primary Border Color: `#E5EAF2` / `#E2E8F0` (Tailwind `slate-200`)
  - Read-Only / Disabled Surfaces: `#E9EDF4` (e.g. Stock on Hand field in Product Details)
  - Muted Surfaces & Table Headers: `#F8FAFC` / `#F1F5F9`
- **Brand & Primary Colors**:
  - Primary Brand / Button Navy: `#0F1E36`
  - Primary Hover: `#1E293B` (Tailwind `slate-800`)
  - Accent / Links / Informational: `#2563EB` (Tailwind `blue-600`)
  - Text Primary: `#0F172A` (Tailwind `slate-900`)
  - Text Secondary: `#64748B` (Tailwind `slate-500`)
  - Text Muted: `#8A99AD` / `#94A3B8` (Tailwind `slate-400`)

---

## 2. Status Badge Design Tokens

Matching Figma Frame specifications (Dot Badge Pattern with high-contrast indicator):

| Status | Dot Color | Dot Hex | Text Style | Figma Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Paid** | Emerald | `#10B981` | `text-slate-800 font-medium` | Orders (Settled) |
| **Partial** | Dark Navy | `#0F1E36` | `text-slate-800 font-medium` | Orders (Partially paid) |
| **Unpaid** | Amber | `#F59E0B` | `text-slate-800 font-medium` | Orders (Pending payment) |
| **Overdue** | Red | `#EF4444` | `text-slate-800 font-medium` | Orders (Past due date) |
| **Draft** | Slate | `#94A3B8` | `text-slate-600 font-medium` | Orders (Unsubmitted) |
| **Cancelled** | Muted Slate | `#94A3B8` | `text-slate-400 line-through` | Orders (Voided) |
| **Active** | Emerald | `#10B981` | `text-slate-800 font-medium` | Categories & Customers |
| **Inactive** | Slate | `#94A3B8` | `text-slate-600 font-medium` | Categories & Customers |

**Component Pattern (`StatusBadge.tsx`):**
```tsx
<span className="inline-flex items-center gap-2 text-xs font-medium text-slate-800">
  <span className="w-2 h-2 rounded-full shrink-0 bg-[#10B981]" />
  Paid
</span>
```

---

## 3. Currency & Number Formatting

- **Currency Symbol**: `₱` (Philippine Peso)
- **Standard Currency Format**: `₱#,##0.00` (e.g. `₱1,250.00`)
- **Quantity & Count Format**: Standard integer notation (e.g. `12 units`, `0 stock`)
- **Date Format**: `MMM DD, YYYY` (e.g. `Oct 14, 2026`) and time notation `hh:mm A`

---

## 4. Typography Scale

- **Page Titles**: `text-xl font-bold text-slate-900`
- **Section / Card Headers**: `text-base font-semibold text-slate-900`
- **Table Headers**: `text-xs font-semibold text-slate-500 uppercase tracking-wider`
- **Table Cell Data**: `text-sm text-slate-800 font-medium`
- **Form Field Labels**: `text-xs font-medium text-slate-700`
- **Helper / Metadata / Timestamps**: `text-xs text-slate-500`

---

## 5. UI Components & Tokens

### Buttons
- **Primary Action**:
  - Class: `bg-[#0F1E36] hover:bg-slate-800 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-xs transition`
- **Secondary / Outline Action**:
  - Class: `border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition`
- **Danger / Destructive Action**:
  - Class: `bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition`
- **Header Actions**:
  - Class: `border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5`

### Form Controls & Inputs
- **Text Inputs & Selects**:
  - Class: `h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1E36] focus:border-transparent transition`
- **Read-Only / Disabled Inputs**:
  - Class: `h-10 w-full rounded-lg border border-slate-300 bg-[#E9EDF4] px-3 py-2 text-sm text-slate-700 cursor-not-allowed`
- **Search Inputs**:
  - Class: `pl-9 pr-3 h-9 w-full sm:w-64 rounded-lg border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1E36]`

### Cards & Tables
- **Standard Card Container**:
  - Class: `bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden`
- **Responsive Table Container**:
  - Class: `w-full overflow-x-auto` with sticky / clean table headers and row hover highlights (`hover:bg-slate-50/60`).

### Modals & Dialogs
- **Backdrop Overlay**:
  - Class: `fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4`
- **Modal Surface**:
  - Class: `bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95`
- **Modal Header**:
  - Class: `flex items-center justify-between px-6 py-4 border-b border-slate-100`
- **Modal Footer**:
  - Class: `flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100`

---

## 6. Feedback & Notifications

- **Toast Banner (Top Fixed)**:
  - Class: `fixed top-5 right-5 z-50 bg-[#0F1E36] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm`
- **Inline Success / Alert Banners**:
  - Green / Success: `bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs`
  - Red / Error: `bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 text-xs`
