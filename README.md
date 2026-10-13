# Dev Activity — Sales & Inventory Web Application

---

## 1. Overview & System Summary

**Dev Activity** is a high-performance web-based Sales and Inventory management system designed for **Ateb Venue**. Built with precision to match the provided Figma specifications 1:1, it delivers end-to-end order processing, product and stock replenishment, multi-tier payment settlements (Cash, Check, Bank Transfer), customer management, categorized catalog management, real-time KPI analytics, and printable/exportable business reports.

All financial figures are processed in **Philippine Peso (₱)** with precise formatting and automated margin reconciliation.

---

## 2. Technical Stack

- **Framework:** Next.js 16 (App Router in `src/app`)
- **UI Library:** React 19 (Server & Client Components)
- **Language:** TypeScript 5.9 (Strict mode enabled)
- **Styling:** Tailwind CSS v4 & custom Ateb design tokens (`#0F1E36`, `#E5EAF2`, `#10B981`)
- **Icons:** Lucide React
- **Package Manager:** `pnpm` (Node v20+, pnpm v9+)
- **State & Persistence:** Reactive Context Store (`src/lib/store.tsx`) with browser `localStorage` persistence, architected to easily swap in Supabase/PostgreSQL.

---

## 3. Getting Started & Setup Steps

### Prerequisites
- Node.js `v20.x` or higher (tested on `v26.1.0`)
- `pnpm` `v9.x` or higher (tested on `v12.11.2`)

### Installation & Run

```bash
# 1. Clone repository and navigate to directory
git clone <repo-url>
cd dev-activity

# 2. Install dependencies (pnpm recommended, or npm)
pnpm install
# or
npm install

# 3. Start development server
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect to `/dashboard` (or `/login`).

### Build & Verification Commands

```bash
# Verify TypeScript compilation and production build (18 routes compiled)
pnpm build
# or: npm run build

# Verify ESLint rules (0 errors, 0 warnings)
pnpm lint
# or: npm run lint
```

---

## 4. Demo Login Credentials

On the `/login` page:
- **Username:** `admin` (or `john` or `belly`)
- **Password:** `password123`

---

## 5. What Was Completed (Modules 01 – 08)

All 8 modules and sub-flows were implemented and refined 1:1 against the Figma design frames:

### 01. Authentication (`/login` — Figma 01.01 – 01.03)
- Dev Activity branding and logo.
- Inline form validation for required fields (`Username is required.`, `Password is required.`) with highlighted red input borders.
- Top error banner for invalid credentials: `Incorrect username or password` with hint `Please check your details and try again.`.
- Password visibility toggle (eye icon).
- Successful login sets reactive session and redirects to `/dashboard`.

### 02. Dashboard (`/dashboard` — Figma 02.01)
- Personalized user greeting based on active profile (`Good morning, {name}`).
- Period selector (`Oct 1 – Oct 31, 2026`).
- **4 Key Summary Cards:** Total Sales, Total Cost, Total Net Sales (Margin), and Number of Orders with custom vector icons.
- **Interactive Sales Overview Graph:** Switchable between Daily, Weekly, and Monthly with hover tooltips showing exact date, sales, and order count.
- **Payment Status Breakdown:** Live progress indicators for Paid, Partial, Unpaid, and Overdue orders with amounts and percentage shares.
- **Payment Methods Distribution:** Custom SVG donut chart with total collected funds in center (Cash `#0F1E36`, Bank Transfer `#10B981`, Check `#8A99AD`).
- **Top Selling Products:** Ranked performers with product thumbnail, category, quantity sold, unit price, and revenue share.
- **Low Stock Products Widget:** Real-time alert list with units left, threshold indicator, and inline "Restock" trigger modal.
- **Top Categories:** Bar chart breakdown.
- **Export Action:** Direct CSV export of dashboard sales metrics.

### 03. Orders Module (`/orders`, `/orders/create`, `/orders/[id]` — Figma 03.01 – 03.24)
- **Order List:**
  - Status tabs with counter badges: *All, Unpaid, Partial, Paid, Overdue, Draft, Cancelled*.
  - Sortable columns (Order No, Order Date, Total).
  - Search by Order Number or Customer Name.
  - Rows-per-page selector (10, 20, 50) and pagination.
  - Dot status badges matching Figma: `● Paid`, `● Partial`, `● Unpaid`, `● Overdue`, `● Draft`, `● Cancelled`.
- **Create Order Wizard:**
  - Header: `< Create Order` with `[Save as draft]` and `[Submit]` (`#0F1E36`).
  - Left column: Add Products search bar with `[Browse]` button + table with thumbnails, Quantity input, Total, and remove item `✕`.
  - Right column (3 stacked cards):
    - **Payment:** Subtotal with items count, clickable `Discount` & `Shipping` rows with amounts, `Total`, `Paid` & `Balance`, and `⊕ Add Payment` action.
    - **Customer Information:** Trigger dropdown (`Search or customer a client ⌵`), dropdown list with `Create New Customer` link, search input, and customer names.
    - **Order Information:** Order Date, Order Number (auto-incremented), Terms (Days), read-only Due Date, Note.
  - **Browse Products Modal (`03.03`):** Search, table with Stock on hand, Price, pagination, `{N} Selected`, and `[Cancel]`, `[Add]`.
  - **Discount Modal (`03.06`, `03.09`):** Add & Edit/View with `[Remove]` & `[Save]`.
  - **Shipping Modal (`03.10`, `03.13`):** Add & Edit/View with `[Remove]` & `[Save]`.
  - **Create Customer Modal (`03.15`):** Inline customer creation.
  - **Add Payment Modal (`03.17`):** Payment tabs (Cash, Check, Bank Transfer), Amount Paid, Reference Number, Note.
  - **Payment Added Notification (`03.19`):** Dark navy top banner `✓ Payment Added` with auto-dismiss.
  - **Order Created (`03.20`):** Redirect to `/orders?created=true` with top dark navy notification banner `✓ Order Created ✕`.
- **View Order Details (`/orders/[id]` — `03.21`, `03.22`):**
  - Header with `More Action ⌵` (`Download`, `Cancel Order`), `🖶 Print`, `⊕ Add Payment`.
  - Collapsible Ordered Products section.
  - Payment card, Customer Information, Order Information, and chronological Activity Logs.

### 04. Customers Module (`/customers`, `/customers/[id]` — Figma 04.01 – 04.05)
- **Customer List (`04.01`):** Single white container with search bar, `+ Add Customer` button, status tabs (*All, Active, Inactive*), clean table, and pagination footer.
- **Add Customer Modal (`04.02`):** Vertical stacked fields for Name, Address, Phone Number, E-mail Address, `[Cancel]`, and `[Submit]`.
- **Customer Details Page (`04.03`):** Header `< Customer Details` with `🗑 Delete`, `⏻ Set Inactive`, `✎ Edit Information`, Left Customer Info card, and Right Order List table.
- **Edit Customer Modal (`04.04`):** Vertical stacked fields prefilled with customer details and `[Cancel]`, `[Save]`.
- **Delete Customer Dialog (`04.05`):** Header `Delete {customerName}?`, text `If you delete {customerName}, this can't be undone.`, `[Cancel]`, and `[Delete Customer]` (`#DC2626`).

### 05. Products & Inventory (`/products`, `/products/create`, `/products/[id]` — Figma 05.01 – 05.04)
- **Product List (`05.01`):** Search Product bar, `+ Add Product` button, status tabs (*All, Active, Inactive*), table with Product thumbnails, Category, Price, Stock on Hand, Status (`● Active` / `● Inactive`), and pagination.
- **Add Product Page (`05.02`):**
  - Header `< Add Product` with `[Cancel]` and `[Submit]`.
  - Left card: SKU, Product Name, Category dropdown, Stock on Hand, Low Stock Alert, Price, Cost per item.
  - Right card: Media upload dashed dropzone with image preview and Active/Inactive toggle.
- **Product Details Page (`05.03`):**
  - Header `< Product Details` with `[⊕ Add Stock]` and `[Save]`.
  - Left card with prefilled fields, Stock on Hand styled with read-only background (`#E9EDF4`), and Price/Cost.
  - Right card with current image and status toggle.
- **Add Stock Modal (`05.04`):** Clean modal with Quantity input, helper `Current stock: {stockOnHand}`, `[Cancel]`, and `[Add]` (`#0F1E36`).

### 06. Categories (`/categories` — Figma 06.01 – 06.03)
- **Category List (`06.01`):** Single white card container with Search Category input, `+ Add Category` button, Category ⌵ and Status columns, and pagination footer.
- **Add Category Modal (`06.02`):** Category Name input with helper `Category names must be unique.`, segmented status toggle with colored dot indicators, `[Cancel]`, and `[Add Category]`.
- **Category Details Modal (`06.03`):** Category Name input, helper `{N} products use this category`, segmented status toggle, left `[Delete]` button, and right `[Cancel]`, `[Save changes]`.

### 07. Reports (`/reports/sales`, `/reports/inventory` — Figma 07.01 – 07.03)
- **Sales Report (`07.01`):**
  - Top filter card: Date (`MM/DD/YYYY - MM/DD/YYYY ⌵`), Customer (`ALL ⌵`), Status (`ALL ⌵`), and `[Submit]` button.
  - Toolbar with `🖶 Print` and `(↓) Export CSV`.
  - Table: Sales Invoice, Order Date, Payment type, Sales Amount, Cost, Net Sales, Status.
  - Pagination footer.
- **Sales Report Date Filter Popover (`07.02`):**
  - Two-month calendar picker (`September 2025` and `October 2025`) with active date range highlight (`Oct 1 – Oct 15`).
  - Right preset list: *Today, Yesterday, Last 7 Days, Last 30 Days, This Month, Last Month, Custom Range*.
  - `[Cancel]` and `[Apply]` buttons.
- **Inventory Report (`07.03`):**
  - Top filter card: Category (`ALL ⌵`), Status (`ALL ⌵`), and `[Submit]` button.
  - 5 metric cards with dark navy icons: Active Products, Out of Stock, Low Stock, Total Inventory Cost, Forecasted Sales.
  - Toolbar with `🖶 Print` and `(↓) Export CSV`.
  - Table: Product Name, Category, Stock On Hand, Inventory Cost, Forecasted Sales, Status.
  - Pagination footer.

### 08. User Profile & Password Change (`/profile` — Figma 08.01 – 08.02)
- **Manage Profile (`08.01`):**
  - Header: `Manage Profile` with top right `[💾 Save]` button.
  - Left card: Circular avatar preview with `[↑ Upload Image]` button.
  - Right card (Account Information):
    - Row 1: Last Name, First Name, Middle Name.
    - Row 2: Email Address, Mobile Number.
    - Divider.
    - Row 3: Username, Password with `[🔒 Change Password]` button.
- **Change Password Modal (`08.02`):**
  - Inputs with right eye toggles: Current Password, New Password, Confirm New Password.
  - Validation checklist card with live status:
    - [x] At least 8 characters
    - [x] One uppercase letter
    - [x] One number
    - [x] One special character
  - `[Cancel]` and `[Update Password]` buttons.

---

## 6. Architecture & Known Gaps

### State Architecture
- **Local Persistence Layer:** All data is held in an offline-ready, reactive React context store (`src/lib/store.tsx`) backed by browser `localStorage`. Changes to products, orders, categories, customers, and user profile survive page reloads and browser restarts.

### Known Gaps / Future Enhancements for Production
1. **Remote Database (Supabase PostgreSQL):**
   - The TypeScript interfaces (`Customer`, `Category`, `Product`, `Order`, `OrderItem`, `OrderPayment`, `UserProfile`) match 1:1 with normalized relational tables.
   - To transition to a live multi-tenant backend, swap the `localStorage` mutations in `src/lib/store.tsx` with Supabase client queries (`@supabase/supabase-js`) backed by PostgreSQL Row Level Security (RLS) policies.
2. **Multi-user Permissions & RBAC:**
   - The current build provides an `Admin` persona (`John Santos`). Real-world production could enforce role gates (`Admin` vs `Cashier` vs `Auditor`) on actions like product deletion or discount overrides.
3. **Automated End-to-End Testing:**
   - Unit and type checks pass with 100% compliance (`pnpm build`). Adding Playwright / Cypress integration tests for the full checkout funnel (`Add Products -> Apply Discount -> Add Cash Payment -> Submit Order`) would further safeguard regression prevention.
4. **Cloud Storage for Image Uploads:**
   - Image uploads currently utilize base64 data URLs / local object URLs. Production deployment would upload assets directly to Supabase Storage or an S3-compatible bucket.

---

## 7. Submission Checklist Verification

- [x] Next.js 16 App Router (`src/app`), React 19, TypeScript strict mode
- [x] Passes `pnpm build` with **0 errors** across all 18 routes
- [x] Passes `pnpm lint` with **0 errors and 0 warnings**
- [x] Philippine Peso (`₱`) currency formatting across all modules
- [x] All 8 modules and corresponding Figma flows (01.01 – 08.02) implemented 1:1
- [x] Responsive on mobile, tablet, and desktop viewports
- [x] Design tokens documented in `docs/design/ui-design-system.md`
