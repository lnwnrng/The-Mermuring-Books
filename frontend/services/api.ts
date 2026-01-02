/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import { Book, CheckoutPayload, Order, User, AuthResponse, CreateBookInput, CategoryStat, CustomerSummary, BookRequest, MissingRequestStatus, Supplier, Procurement, ProcurementStatus, StatsOverview, Favorite } from '../types';

const getBaseUrl = () => {
  const base = (API_BASE_URL || '').trim();
  if (!base) return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const url = `${getBaseUrl()}${path}`;
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('yiyu_token') : null;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore JSON parsing failure for error responses
    }
    throw new Error(message);
  }

  // Handle empty responses (e.g., 204)
  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }
  return JSON.parse(text) as T;
};

export const fetchBooks = async (): Promise<Book[]> => {
  return request<Book[]>(API_ENDPOINTS.books);
};

export const fetchMe = async (): Promise<User> => {
  return request<User>(API_ENDPOINTS.me);
};

export const updateMe = async (payload: Partial<Pick<User, 'name' | 'phone' | 'avatar'>>): Promise<User> => {
  return request<User>(API_ENDPOINTS.me, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const topUpBalance = async (amount: number): Promise<User> => {
  return request<User>(`${API_ENDPOINTS.me}/balance`, {
    method: 'PATCH',
    body: JSON.stringify({ amount }),
  });
};

// Favorites
export const fetchFavorites = async (): Promise<Favorite[]> => {
  return request<Favorite[]>(API_ENDPOINTS.favorites);
};

export const addFavorite = async (bookId: string): Promise<Favorite> => {
  return request<Favorite>(API_ENDPOINTS.favorites, {
    method: 'POST',
    body: JSON.stringify({ bookId }),
  });
};

export const removeFavorite = async (bookId: string): Promise<void> => {
  await request<void>(`${API_ENDPOINTS.favorites}/${bookId}`, { method: 'DELETE' });
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  return request<AuthResponse>(API_ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  return request<AuthResponse>(API_ENDPOINTS.register, {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
};

export const createOrder = async (payload: CheckoutPayload): Promise<{ order: Order; balance?: number }> => {
  return request<{ order: Order; balance?: number }>(API_ENDPOINTS.orders, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const createBook = async (data: CreateBookInput): Promise<Book> => {
  return request<Book>(API_ENDPOINTS.books, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateBook = async (id: string, data: Partial<CreateBookInput>): Promise<Book> => {
  return request<Book>(`${API_ENDPOINTS.books}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteBook = async (id: string): Promise<void> => {
  await request<void>(`${API_ENDPOINTS.books}/${id}`, {
    method: 'DELETE',
  });
};

export const fetchLowStockBooks = async (threshold = 5): Promise<Book[]> => {
  const url = `${API_ENDPOINTS.lowStock}?threshold=${threshold}`;
  return request<Book[]>(url);
};

export const fetchCategories = async (): Promise<CategoryStat[]> => {
  return request<CategoryStat[]>(API_ENDPOINTS.categories);
};

export const fetchCustomers = async (): Promise<CustomerSummary[]> => {
  return request<CustomerSummary[]>(API_ENDPOINTS.customers);
};

export const updateCustomerCredit = async (id: string, creditLevel: string): Promise<CustomerSummary> => {
  return request<CustomerSummary>(`${API_ENDPOINTS.customers}/${id}/credit`, {
    method: 'PATCH',
    body: JSON.stringify({ creditLevel }),
  });
};

export const updateCustomerBalance = async (id: string, delta: number): Promise<CustomerSummary> => {
  return request<CustomerSummary>(`${API_ENDPOINTS.customers}/${id}/balance`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  });
};

export const fetchMyOrders = async (): Promise<Order[]> => {
  return request<Order[]>(`${API_ENDPOINTS.orders}/mine`);
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  return request<Order[]>(API_ENDPOINTS.orders);
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order> => {
  return request<Order>(`${API_ENDPOINTS.orders}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Missing book requests
export const createBookRequest = async (payload: { title: string; author?: string; note?: string }): Promise<BookRequest> => {
  return request<BookRequest>(API_ENDPOINTS.bookRequests, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchBookRequests = async (): Promise<BookRequest[]> => {
  return request<BookRequest[]>(API_ENDPOINTS.bookRequests);
};

export const updateBookRequestStatus = async (id: string, status: MissingRequestStatus): Promise<BookRequest> => {
  return request<BookRequest>(`${API_ENDPOINTS.bookRequests}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Suppliers
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  return request<Supplier[]>(API_ENDPOINTS.suppliers);
};

export const createSupplier = async (payload: {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  rating?: number;
  note?: string;
}): Promise<Supplier> => {
  return request<Supplier>(API_ENDPOINTS.suppliers, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateSupplier = async (
  id: string,
  payload: {
    name?: string;
    contact?: string;
    phone?: string;
    email?: string;
    rating?: number;
    note?: string;
  }
): Promise<Supplier> => {
  return request<Supplier>(`${API_ENDPOINTS.suppliers}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteSupplier = async (id: string): Promise<void> => {
  await request<void>(`${API_ENDPOINTS.suppliers}/${id}`, {
    method: 'DELETE',
  });
};

// Procurements
export const fetchProcurements = async (status?: ProcurementStatus): Promise<Procurement[]> => {
  const url = status ? `${API_ENDPOINTS.procurements}?status=${status}` : API_ENDPOINTS.procurements;
  return request<Procurement[]>(url);
};

export const createProcurement = async (payload: {
  supplierId: string;
  bookId: string;
  quantity: number;
  expectedDate?: string;
  note?: string;
  status?: ProcurementStatus;
}): Promise<Procurement> => {
  return request<Procurement>(API_ENDPOINTS.procurements, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateProcurementStatus = async (id: string, status: ProcurementStatus): Promise<Procurement> => {
  return request<Procurement>(`${API_ENDPOINTS.procurements}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Stats
export const fetchStatsOverview = async (): Promise<StatsOverview> => {
  return request<StatsOverview>(API_ENDPOINTS.statsOverview);
};
