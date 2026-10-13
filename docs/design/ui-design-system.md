# UI Design System — Dev Activity

## 1. Visual Hierarchy & Theme
- **Theme**: Enterprise-grade Clean Light Mode with Slate / Indigo accents.
- **Font**: Inter / Geist Sans system font stack for crisp readability.
- **Surface Colors**:
  - App Background: `#F8FAFC` (Tailwind `slate-50`)
  - Card & Modal Background: `#FFFFFF` (Tailwind `white`)
  - Border Color: `#E2E8F0` (Tailwind `slate-200`)
  - Muted Surfaces: `#F1F5F9` (Tailwind `slate-100`)
- **Brand & Primary Colors**:
  - Primary Brand: `#0F172A` (Slate 900) & `#2563EB` (Blue 600)
  - Primary Hover: `#1E293B` (Slate 800) & `#1D4ED8` (Blue 700)
  - Text Primary: `#0F172A` (Slate 900)
  - Text Secondary: `#64748B` (Slate 500)
  - Text Muted: `#94A3B8` (Slate 400)

## 2. Status Badge Color Tokens
Matching Figma specs exactly:
- **Draft**: Grey — `bg-slate-100 text-slate-700 border-slate-200`
- **Unpaid**: Amber — `bg-amber-50 text-amber-700 border-amber-200`
- **Partial**: Dark — `bg-slate-900 text-white border-slate-900`
- **Overdue**: Red — `bg-rose-50 text-rose-700 border-rose-200`
- **Paid**: Green — `bg-emerald-50 text-emerald-700 border-emerald-200`
- **Cancelled**: Muted Gray — `bg-zinc-100 text-zinc-500 border-zinc-200`

## 3. Currency & Number Formatting
- Currency symbol: `₱` (Philippine Peso)
- Standard format: `₱#,##0.00`
- Negative amounts: `-₱#,##0.00`

## 4. Typography
- Display Title: `text-2xl font-bold tracking-tight text-slate-900`
- Page Section Header: `text-lg font-semibold text-slate-900`
- Table Header: `text-xs font-semibold uppercase tracking-wider text-slate-500`
- Table Cell: `text-sm text-slate-700 font-medium`
- Body / Form Label: `text-sm font-medium text-slate-700`
- Help Text / Caption: `text-xs text-slate-500`

## 5. Interactive Components
- **Buttons**:
  - Primary: `bg-slate-900 hover:bg-slate-800 text-white shadow-xs rounded-lg px-4 py-2 font-medium text-sm transition`
  - Secondary / Outline: `border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 font-medium text-sm transition`
  - Danger: `bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 py-2 font-medium text-sm transition`
- **Inputs**:
  - Base: `h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition`
  - Error state: `border-rose-500 focus:ring-rose-500`
- **Modals / Dialogs**:
  - Overlay: `bg-black/50 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4`
  - Container: `bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden`
