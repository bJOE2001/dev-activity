# Dev Activity — Sales & Inventory Web Application

> **Ateb Technical Assessment Submission**  
> **Candidate:** Belly Joe Basadre (Full-Stack Developer)  
> **Company:** Ateb AI / Ateb Venue  
> **Reviewers:** Nathan Bowen (Founder), John Policarpio (Product Lead)  
> **GitHub Invitation Target:** `product@ateb.ai`

---

## 1. Overview & System Summary

**Dev Activity** is a high-performance web-based Sales and Inventory management system designed for **Ateb Venue**. It delivers end-to-end order processing, product and stock replenishment, multi-tier payment settlements (Cash, Check, Bank Transfer), customer management, categorized catalog management, real-time KPI analytics, and printable/exportable business reports.

All financial figures are processed in **Philippine Peso (₱)** with precise rounding and automated margin reconciliation.

---

## 2. Technical Stack

- **Framework:** Next.js 16 (App Router in `src/app`)
- **UI Library:** React 19 (Server & Client Components)
- **Language:** TypeScript 5.9 (Strict mode enabled)
- **Styling:** Tailwind CSS v4 & custom design tokens
- **Icons:** Lucide React
- **Package Manager:** `pnpm` (Node v26.1.0, pnpm v12.11.2)
- **State & Persistence:** Reactive Context Store with browser `localStorage` persistence, designed with a Supabase-ready relational architecture.

---

## 3. Getting Started & Setup Steps

### Prerequisites
- Node.js `v20.x` or higher (developed on `v26.1.0`)
- `pnpm` `v9.x` or higher (developed on `v12.11.2`)

### Installation & Run

```bash
# 1. Clone repository and navigate to directory
git clone <repo-url>
cd dev-activity

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/dashboard` (or `/login`).

### Build & Verification Commands

```bash
# Verify TypeScript compilation and production build
pnpm build

# Verify ESLint rules (0 errors, 0 warnings)
pnpm lint
```

---

## 4. Demo Login Credentials

On the `/login` page:
- **Username:** `admin` (or `john` or `belly`)
- **Password:** `password123`

---

## 5. What Was Completed (Modules 01 – 08)

### 01. Authentication (`/login` — Figma 01.01 – 01.03)
- Dev Activity branding and logo.
- Inline form validation for required fields (`Username is required.`, `Password is required.`) with highlighted input borders.
- Error banner for invalid credentials: `Incorrect username or password` with hint `Please check your details and try again.`.
- Successful login sets reactive session and redirects to `/dashboard`.

### 02. Dashboard (`/dashboard` — Figma 02.01)
- Personalized user greeting based on active profile.
- Period selector defaulting to **Oct 1 – Oct 31, 2026**.
- **Key Summary Cards:** Total Sales, Total Cost, Total Net Sales (Margin), and Number of Orders.
- **Interactive Sales Overview Graph:** Switchable between Daily, Weekly, and Monthly with hover tooltips showing exact date, sales, and order velocity.
- **Payment Status Breakdown:** Live progress indicators for Paid, Partial, Unpaid, and Overdue orders with amounts and percentage shares.
- **Payment Methods Distribution:** Custom SVG donut chart with total collected funds in the center (Cash, Bank Transfer, Check).
- **Top Selling Products:** Ranked top 5 performers with product thumbnail, category, quantity sold, unit price, and revenue share.
- **Low Stock Products Widget:** Real-time alert list with units left, threshold indicator, and inline "Restock" trigger modal.
- **Top Categories:** Bar chart breakdown with quick navigation to reports.
- **Export Action:** Direct CSV export of dashboard sales metrics.

### 03. Orders Module (`/orders`, `/orders/create`, `/orders/[id]` — Figma 03.01 – 03.24)
- **Order List:**
  - Status tabs with counter badges: *All, Unpaid, Partial, Paid, Overdue, Draft, Cancelled*.
  - Sortable columns (Order No, Order Date, Total).
  - Search by Order Number or Customer Name.
  - Rows-per-page selector (5, 10, 25, 50) and pagination.
  - Coloured indicators matching Figma: Draft (grey), Unpaid (amber), Partial (dark), Overdue (red), Paid (green), Cancelled (muted).
- **Create Order Wizard:**
  - Sequential Order Number auto-generation (e.g. `#0000011`).
  - Terms (Days) input with auto-computed read-only **Due Date** (`Order Date + Terms`).
  - Searchable Customer dropdown + inline **"Create New Customer" modal**.
  - **Browse Products Modal:** Multi-select checklist with "N Selected" counter, category filter, stock display, and pagination.
  - Interactive line item controls: unit prices, quantity adjuster, line totals, and remove item action.
  - **Add Discount Modal:** Amount + note, rendered as `Discount · note · −amount` with edit and remove controls.
  - **Add Shipping Modal:** Amount + note, rendered as `Shipping · note · amount` with edit and remove controls.
  - **Add Payment Modal:** Method tabs (*Cash, Check, Bank Transfer*) supporting partial payments, bank details, and proof upload simulation.
  - Balance auto-computed: `Total − Paid`.
  - **Draft vs Submit Logic:** Draft preserves stock without deduction; Submit automatically deducts product inventory, updates customer total transactions, writes timestamped activity logs, and triggers confirmation toast.
- **View Order Details:**
  - Header actions: *Print (print-optimized CSS), Download JSON/receipt, Cancel Order (restores inventory), Add Payment*.
  - Collapsible Ordered Products section.
  - Detailed Customer and Order terms breakdown.
  - Timestamped chronological **Order Activity Logs** timeline.

### 04. Customers Module (`/customers`, `/customers/[id]` — Figma 04.01 – 04.05)
- Customer list with search, status tabs (*All, Active, Inactive*), and sortable names.
- Dynamic calculation of lifetime total transactions from confirmed orders.
- **Add Customer Modal** & **Edit Information Modal**.
- **Customer Details Page:** Contact card, financial summary (total spent, outstanding balance), and complete customer order history.
- Set Active / Set Inactive toggle.
- **Delete Customer Confirmation Dialog:** `Delete [name]?` — `If you delete [name], this can't be undone.`.

### 05. Products & Inventory (`/products` — Figma 05.01 – 05.04)
- Product catalog table with thumbnails, categories, pricing, stock levels, and status badges.
- **Low Stock Indicator Badge:** Dynamically triggers when `Stock on Hand <= Low Stock Alert`.
- **Add Product Modal:** SKU, Name, Category select (with inline new category creation), Initial Stock, Alert Level, Price, Cost, Image URL, and Status toggle.
- **Edit Product Details:** Edits product attributes while keeping Stock on Hand read-only.
- **Add Stock Modal:** Displays `Current stock: N` helper text, updates stock count immediately upon submission.

### 06. Categories (`/categories` — Figma 06.01 – 06.03)
- Category list with search, status filters, and pagination.
- **Assigned Products Badge:** Displays live count (`"N products use this category"`).
- **Add Category Modal:** Unique category name validation prevents duplicate entries.
- **Edit & Delete Category Modal:** Blocks accidental deletion if products are currently assigned to the category.

### 07. Reports (`/reports/sales`, `/reports/inventory` — Figma 07.01 – 07.03)
- **Sales Report:**
  - Date preset filter (*This Month, Today, Yesterday, Last 7 Days, Last 30 Days, Last Month, All Time*).
  - Customer & Status filters.
  - Aggregate metrics: Total Sales, Cost of Goods, Net Sales Margin, Average Order Value.
  - Table: Sales Invoice, Order Date, Customer, Payment Type, Sales Amount, Cost, Net Sales, Status.
  - Print & Export CSV features.
- **Inventory Report:**
  - Category & Status filters.
  - Metric cards: Active Products, Out of Stock, Low Stock, Total Inventory Cost, Forecasted Sales.
  - Table: Product Name (sortable), Category, Stock on Hand, Inventory Cost, Forecasted Sales, Status.
  - Print & Export CSV features.

### 08. User Profile & Password Change (`/profile` — Figma 08.01 – 08.02)
- Accessible directly from the sidebar footer user avatar.
- Profile photo upload preview.
- Personal information editing: First, Middle, Last Name, Email, Mobile, Username.
- **Change Password Modal:**
  - Inputs for Current, New, and Confirm New passwords, each with show/hide eye toggles.
  - **Live Checklist Validation:** Dynamically ticks off criteria:
    - [x] At least 8 characters
    - [x] One uppercase letter
    - [x] One number
    - [x] One special character
- Sidebar footer logout action with session termination.

---

## 6. Architecture & Known Gaps

- **State Persistence:** Local storage persistence layer allows the full application to run offline and endure reloads during live testing and assessment review.
- **Supabase Integration Architecture:** All models (`Customer`, `Category`, `Product`, `Order`, `OrderItem`, `OrderPayment`, `OrderActivityLog`, `UserProfile`) match standard relational database schemas with 1-to-many relationships. Transitioning to Supabase PostgreSQL only requires wiring the existing store methods to Supabase client SDK calls (`@supabase/supabase-js`) with RLS policies.

---

## 7. Submission Checklist Verification

- [x] Next.js 16 App Router (`src/app`), React 19, TypeScript strict mode
- [x] Pass `pnpm build` with 0 errors
- [x] Pass `pnpm lint` with 0 errors and 0 warnings
- [x] Philippine Peso (`₱`) currency formatting across all modules
- [x] All 8 modules and corresponding Figma flows (01.01 – 08.02) implemented
- [x] Design tokens documented in `docs/design/ui-design-system.md`
