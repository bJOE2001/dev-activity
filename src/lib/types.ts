export type OrderStatus = 'Draft' | 'Unpaid' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Check' | 'Bank Transfer';

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  totalTransaction: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  stockOnHand: number;
  lowStockAlert: number;
  imageUrl: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  cost: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  paidAt: string;
  referenceNumber?: string;
  note?: string;
  bankName?: string;
  bankAccountNumber?: string;
  checkNumber?: string;
  checkDate?: string;
  proofOfPayment?: string;
}

export interface OrderActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  userName: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  terms: number;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: {
    amount: number;
    note: string;
  } | null;
  shipping: {
    amount: number;
    note: string;
  } | null;
  total: number;
  paid: number;
  balance: number;
  paymentType: PaymentMethod | 'None';
  payments: OrderPayment[];
  status: OrderStatus;
  note: string;
  logs: OrderActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  photoUrl: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalCost: number;
  totalNetSales: number;
  orderCount: number;
}
