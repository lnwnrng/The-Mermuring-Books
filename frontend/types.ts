/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  price: number;
  category: string;
  coverUrl: string;
  description: string;
  stock: number;
  publishDate: string;
}

export interface Favorite {
  id: string;
  bookId: string;
  createdAt: string;
  book: Book;
}

export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  balance: number;
  creditLevel: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  longDescription?: string;
  features: string[];
  imageUrl: string;
  sizes?: string[];
}

export interface CheckoutPayload {
  items: Book[];
  contact: {
    name: string;
    phone: string;
    region: string;
    address: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  userId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateBookInput {
  title: string;
  author: string;
  publisher?: string;
  isbn: string;
  price: number;
  category: string;
  coverUrl?: string;
  description?: string;
  stock?: number;
  publishDate?: string;
}

export type UpdateBookInput = Partial<CreateBookInput>;

export interface CategoryStat {
  category: string | null;
  count: number;
}

export interface CustomerSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  creditLevel?: string | null;
  balance: number;
  createdAt: string;
}

export interface OrderItem {
  book: Book;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  contactName: string;
  contactPhone: string;
  region: string;
  address: string;
  items: OrderItem[];
  userId?: string | null;
}

export type MissingRequestStatus = 'open' | 'reviewing' | 'ordered' | 'stocked' | 'rejected';

export interface BookRequest {
  id: string;
  title: string;
  author?: string | null;
  note?: string | null;
  status: MissingRequestStatus;
  createdAt: string;
  contactName?: string | null;
  contactEmail?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  rating?: number | null;
  note?: string | null;
  createdAt: string;
}

export type ProcurementStatus = 'open' | 'ordered' | 'received' | 'cancelled';

export interface Procurement {
  id: string;
  supplierId: string;
  bookId: string;
  quantity: number;
  status: ProcurementStatus;
  expectedDate?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier | null;
  book?: Book | null;
}

export interface StatsOverview {
  totalSales: number;
  orderCount: number;
  userCount: number;
  bookCount: number;
  statusCounts: Record<string, number>;
  monthly: { month: string; total: number }[];
  topBooks: { title: string; sold: number; revenue: number }[];
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'book-list' }
  | { type: 'book-detail', book: Book }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'success' }
  | { type: 'auth', mode: 'login' | 'register' | 'forgot' }
  | { type: 'user-center', tab?: string }
  | { type: 'admin-panel', tab?: string };
