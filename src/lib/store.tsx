'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Category, Product, Order, OrderPayment, UserProfile } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_USER,
} from './mock-data';
import { computeOrderStatus } from './utils';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Auth & Profile
  user: UserProfile;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUser: (profile: Partial<UserProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message?: string };

  // Categories
  categories: Category[];
  addCategory: (data: { name: string; status: 'Active' | 'Inactive' }) => { success: boolean; message?: string; category?: Category };
  updateCategory: (id: string, updates: Partial<Category>) => { success: boolean; message?: string };
  deleteCategory: (id: string) => { success: boolean; message?: string };

  // Products
  products: Product[];
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addStock: (id: string, quantity: number) => void;
  deleteProduct: (id: string) => void;

  // Customers
  customers: Customer[];
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'totalTransaction'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => { success: boolean; message?: string };

  // Orders
  orders: Order[];
  getNextOrderNumber: () => string;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'logs'>, isDraft: boolean) => Order;
  addPaymentToOrder: (orderId: string, payment: Omit<OrderPayment, 'id' | 'paidAt'>) => void;
  cancelOrder: (orderId: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'dev_activity_';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage after mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth');
      if (storedAuth !== null) setIsAuthenticated(JSON.parse(storedAuth));

      const storedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedCategories = localStorage.getItem(STORAGE_KEY_PREFIX + 'categories');
      if (storedCategories) setCategories(JSON.parse(storedCategories));

      const storedProducts = localStorage.getItem(STORAGE_KEY_PREFIX + 'products');
      if (storedProducts) setProducts(JSON.parse(storedProducts));

      const storedCustomers = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));

      const storedOrders = localStorage.getItem(STORAGE_KEY_PREFIX + 'orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (e) {
      console.error('Failed to load local state', e);
    }
    setMounted(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'auth', JSON.stringify(isAuthenticated));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'user', JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'customers', JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save local state', e);
    }
  }, [mounted, isAuthenticated, user, categories, products, customers, orders]);

  // Toast helper
  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth
  const login = (username: string, pass: string): boolean => {
    // Accepts admin/password123, belly, or john, or any existing username
    const u = username.toLowerCase().trim();
    if (
      (u === 'admin' || u === 'johnsantos' || u === 'john' || u === 'belly' || u === user.username.toLowerCase()) &&
      pass.length > 0
    ) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateUser = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
    addToast('Profile updated', 'Your account information has been saved.');
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!oldPass) {
      return { success: false, message: 'Current password is required.' };
    }
    if (newPass.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }
    addToast('Password Changed', 'Your password has been successfully updated.');
    return { success: true };
  };

  // Categories
  const addCategory = (data: { name: string; status: 'Active' | 'Inactive' }) => {
    const trimmed = data.name.trim();
    if (!trimmed) {
      return { success: false, message: 'Category name is required.' };
    }
    const duplicate = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      return { success: false, message: 'Category names must be unique.' };
    }
    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name: trimmed,
      status: data.status,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCategories((prev) => [newCategory, ...prev]);
    addToast('Category Created', `Category "${trimmed}" has been created.`);
    return { success: true, category: newCategory };
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (updates.name) {
      const trimmed = updates.name.trim();
      const duplicate = categories.some(
        (c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        return { success: false, message: 'Category names must be unique.' };
      }
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    // Also update categoryName in products if name changed
    if (updates.name) {
      setProducts((prev) =>
        prev.map((p) => (p.categoryId === id ? { ...p, categoryName: updates.name! } : p))
      );
    }
    addToast('Category Updated', 'Changes saved successfully.');
    return { success: true };
  };

  const deleteCategory = (id: string) => {
    const productsCount = products.filter((p) => p.categoryId === id).length;
    if (productsCount > 0) {
      return {
        success: false,
        message: `Cannot delete category. ${productsCount} products are assigned to this category.`,
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category Deleted', 'The category has been removed.');
    return { success: true };
  };

  // Products
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...data,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProd, ...prev]);
    addToast('Product Created', `Product "${newProd.name}" added successfully.`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast('Product Updated', 'Product details saved.');
  };

  const addStock = (id: string, quantity: number) => {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockOnHand: p.stockOnHand + qty } : p))
    );
    addToast('Stock Added', `Added ${qty} units to stock.`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Product Deleted', 'Product removed.');
  };

  // Customers
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'totalTransaction'>) => {
    const newCust: Customer = {
      ...data,
      id: 'cust-' + Date.now(),
      totalTransaction: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    addToast('Customer Created', `Customer "${newCust.name}" has been added.`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addToast('Customer Updated', 'Customer information saved.');
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    addToast('Customer Deleted', `Customer ${cust?.name || ''} has been deleted.`);
    return { success: true };
  };

  // Orders
  const getNextOrderNumber = () => {
    const existingNums = orders
      .map((o) => parseInt(o.orderNumber, 10))
      .filter((n) => !isNaN(n));
    const max = existingNums.length > 0 ? Math.max(...existingNums) : 10;
    const next = max + 1;
    return String(next).padStart(7, '0');
  };

  const createOrder = (
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'logs'>,
    isDraft: boolean
  ) => {
    const nowIso = new Date().toISOString();
    const nowStr = new Date().toLocaleString();
    const finalStatus = isDraft
      ? 'Draft'
      : computeOrderStatus('Unpaid', orderData.total, orderData.paid, orderData.dueDate);

    const initialLogs = [
      {
        id: 'log-' + Date.now(),
        timestamp: nowStr,
        action: isDraft ? 'Order Draft Saved' : 'Order Created',
        details: isDraft
          ? 'Saved as draft without inventory deduction'
          : `Order created with ${orderData.items.length} items. Total: ₱${orderData.total.toFixed(2)}`,
        userName: user.firstName + ' ' + user.lastName,
      },
    ];

    if (!isDraft && orderData.paid > 0 && orderData.payments.length > 0) {
      initialLogs.push({
        id: 'log-' + (Date.now() + 1),
        timestamp: nowStr,
        action: 'Payment Added',
        details: `Initial payment of ₱${orderData.paid.toFixed(2)} via ${orderData.paymentType}`,
        userName: user.firstName + ' ' + user.lastName,
      });
    }

    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + orderData.orderNumber,
      status: finalStatus,
      logs: initialLogs,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Deduct stock if NOT draft
    if (!isDraft) {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = orderData.items.find((i) => i.productId === prod.id);
          if (item) {
            return {
              ...prod,
              stockOnHand: Math.max(0, prod.stockOnHand - item.quantity),
            };
          }
          return prod;
        })
      );

      // Update customer total transaction
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === orderData.customerId
            ? { ...c, totalTransaction: c.totalTransaction + orderData.total }
            : c
        )
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    addToast(isDraft ? 'Draft Saved' : 'Order Created', `Order #${newOrder.orderNumber} successfully processed.`);
    return newOrder;
  };

  const addPaymentToOrder = (
    orderId: string,
    payment: Omit<OrderPayment, 'id' | 'paidAt'>
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newPaymentId = 'pay-' + Date.now();
    const paidAtStr = new Date().toLocaleString();
    const newPayment: OrderPayment = {
      ...payment,
      id: newPaymentId,
      paidAt: paidAtStr,
    };

    const newPaid = order.paid + payment.amount;
    const newBalance = Math.max(0, order.total - newPaid);
    const newStatus = computeOrderStatus(order.status, order.total, newPaid, order.dueDate);
    const newPaymentType = payment.method;

    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: paidAtStr,
      action: 'Payment Added',
      details: `Payment of ₱${payment.amount.toFixed(2)} recorded via ${payment.method}${payment.referenceNumber ? ` (Ref: ${payment.referenceNumber})` : ''}`,
      userName: user.firstName + ' ' + user.lastName,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paid: newPaid,
              balance: newBalance,
              status: newStatus,
              paymentType: newPaymentType,
              payments: [...o.payments, newPayment],
              logs: [newLog, ...o.logs],
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    addToast('Payment Added', `₱${payment.amount.toFixed(2)} recorded via ${payment.method}.`);
  };

  const cancelOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Restore stock if it was not a draft
    if (order.status !== 'Draft' && order.status !== 'Cancelled') {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = order.items.find((i) => i.productId === prod.id);
          if (item) {
            return {
              ...prod,
              stockOnHand: prod.stockOnHand + item.quantity,
            };
          }
          return prod;
        })
      );

      // Decrement customer total transaction
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === order.customerId
            ? { ...c, totalTransaction: Math.max(0, c.totalTransaction - order.total) }
            : c
        )
      );
    }

    const cancelLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      action: 'Order Cancelled',
      details: 'Order marked as cancelled. Stock restored.',
      userName: user.firstName + ' ' + user.lastName,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelled',
              logs: [cancelLog, ...o.logs],
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    addToast('Order Cancelled', `Order #${order.orderNumber} has been cancelled.`);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateUser,
        changePassword,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        addStock,
        deleteProduct,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        orders,
        getNextOrderNumber,
        createOrder,
        addPaymentToOrder,
        cancelOrder,
        toasts,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
