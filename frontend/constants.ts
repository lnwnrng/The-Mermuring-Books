/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const BRAND_NAME = '呓语书屋';

// 后端基础地址通过环境变量传入，前端只负责调用
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_ENDPOINTS = {
  books: '/books',
  favorites: '/favorites',
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  lowStock: '/books/low-stock',
  categories: '/books/categories',
  customers: '/customers',
  orders: '/orders',
  bookRequests: '/procurements/requests',
  procurements: '/procurements',
  suppliers: '/suppliers',
  statsOverview: '/stats/overview',
};
