/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useMemo, useState } from 'react';
import { createBook, deleteBook, updateBook, fetchLowStockBooks, fetchCategories, fetchAllOrders, updateOrderStatus, fetchCustomers, updateCustomerBalance, updateCustomerCredit, fetchBookRequests, updateBookRequestStatus, fetchSuppliers, fetchProcurements, createProcurement, updateProcurementStatus, createSupplier, updateSupplier, deleteSupplier, fetchStatsOverview } from '../services/api';
import { Book, CreateBookInput, CategoryStat, Order, CustomerSummary, BookRequest, MissingRequestStatus, Supplier, Procurement, ProcurementStatus, StatsOverview } from '../types';
import { API_BASE_URL } from '../constants';

interface AdminPanelProps {
  onExit: () => void;
  onBookCreated?: () => void;
  books: Book[];
  onReloadBooks: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onExit, onBookCreated, books, onReloadBooks }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [subPage, setSubPage] = useState<string>('仪表盘');
  const emptyForm: CreateBookInput = {
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    price: 0,
    category: '',
    coverUrl: '',
    description: '',
    stock: 0,
    publishDate: '',
  };
  const [bookForm, setBookForm] = useState<CreateBookInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [bookMessage, setBookMessage] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [lowStock, setLowStock] = useState<Book[]>([]);
  const [threshold, setThreshold] = useState<number>(5);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [catError, setCatError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [procurements, setProcurements] = useState<Procurement[]>([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [supplierMessage, setSupplierMessage] = useState<string | null>(null);
  const [supplierSubmitting, setSupplierSubmitting] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    maintenance: false,
    notifyAdmin: true,
    logLevel: 'info',
  });
  const [supplierForm, setSupplierForm] = useState({
    id: '',
    name: '',
    contact: '',
    phone: '',
    email: '',
    rating: '',
    note: '',
  });
  const [procurementLoading, setProcurementLoading] = useState(false);
  const [procurementError, setProcurementError] = useState<string | null>(null);
  const [procurementMessage, setProcurementMessage] = useState<string | null>(null);
  const [procurementSubmitting, setProcurementSubmitting] = useState(false);
  const [procurementForm, setProcurementForm] = useState({
    bookId: '',
    supplierId: '',
    quantity: 1,
    expectedDate: '',
    note: '',
  });

  const modules = [
    { id: 'dashboard', label: '仪表盘', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
    { id: 'books', label: '图书管理', icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
    { id: 'orders', label: '订单发货', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.767a1.125 1.125 0 01-1.125 1.125H9.75v-3.25a1.125 1.125 0 011.125-1.125h2.25a1.125 1.125 0 011.125 1.125v3.25a1.125 1.125 0 01-1.125 1.125H9' },
    { id: 'customers', label: '客户管理', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
    { id: 'purchase', label: '采购管理', icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z' },
    { id: 'supplier', label: '供应商', icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5M12 6.75h1.5M15 6.75h1.5M9 10.5h1.5M12 10.5h1.5M15 10.5h1.5M9 14.25h1.5M12 14.25h1.5M15 14.25h1.5M9 18h1.5M12 18h1.5M15 18h1.5' },
    { id: 'stats', label: '统计报表', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
    { id: 'settings', label: '系统设置', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' },
  ];

  const subPages: Record<string, string[]> = {
    dashboard: ['仪表盘'],
    books: ['图书列表', '新增图书', '库存预警', '基础数据管理'],
    orders: ['所有订单', '待发货', '发货记录'],
    customers: ['客户列表', '信用管理', '余额调整'],
    purchase: ['缺书登记', '采购单', '到货处理'],
    supplier: ['供应商列表', '新增供应商'],
    stats: ['销售统计', '热销排行', '库存分析'],
  };

  const filteredBooks = useMemo(() => books, [books]);
  const filteredOrders = useMemo(() => {
    if (subPage === '待发货') {
      return orders.filter((o) => o.status === 'pending' || o.status === 'processing');
    }
    if (subPage === '发货记录') {
      return orders.filter((o) => o.status === 'shipped' || o.status === 'completed');
    }
    return orders;
  }, [orders, subPage]);

  const filteredProcurements = useMemo(() => {
    if (subPage === '到货处理') {
      return procurements.filter((p) => p.status === 'open' || p.status === 'ordered');
    }
    return procurements;
  }, [procurements, subPage]);

  const loadLowStock = async (value?: number) => {
    try {
      const list = await fetchLowStockBooks(value ?? threshold);
      setLowStock(list);
    } catch (err) {
      setBookError(err instanceof Error ? err.message : '获取库存预警失败');
    }
  };

  const loadCategories = async () => {
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : '获取分类失败');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : '获取订单失败');
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestLoading(true);
      setRequestError(null);
      const data = await fetchBookRequests();
      setBookRequests(data);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : '获取缺书登记失败');
    } finally {
      setRequestLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      setSupplierLoading(true);
      setSupplierError(null);
      const list = await fetchSuppliers();
      setSuppliers(list);
    } catch (err) {
      setSupplierError(err instanceof Error ? err.message : '获取供应商失败');
    } finally {
      setSupplierLoading(false);
    }
  };

  const loadProcurements = async (status?: ProcurementStatus) => {
    try {
      setProcurementLoading(true);
      setProcurementError(null);
      const list = await fetchProcurements(status);
      setProcurements(list);
    } catch (err) {
      setProcurementError(err instanceof Error ? err.message : '获取采购单失败');
    } finally {
      setProcurementLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await fetchStatsOverview();
      setStats(data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : '获取统计失败');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      setCustomerLoading(true);
      setCustomerError(null);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      setCustomerError(err instanceof Error ? err.message : '获取客户失败');
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    if (activeModule === 'orders') {
      loadOrders();
    }
    if (activeModule === 'customers') {
      loadCustomers();
    }
    if (activeModule === 'purchase' && subPage === '缺书登记') {
      loadRequests();
    }
    if (activeModule === 'purchase') {
      loadSuppliers();
      loadProcurements();
    }
    if (activeModule === 'supplier') {
      loadSuppliers();
    }
    if (activeModule === 'stats') {
      loadStats();
      if (subPage === '库存分析') {
        loadLowStock(threshold);
        loadCategories();
      }
    }
    if (activeModule === 'dashboard') {
      loadStats();
      loadLowStock(threshold);
      loadOrders();
    }
  }, [activeModule, subPage, threshold]);

  useEffect(() => {
    if (supplierMessage) {
      const timer = setTimeout(() => setSupplierMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [supplierMessage]);

  useEffect(() => {
    if (procurementMessage) {
      const timer = setTimeout(() => setProcurementMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [procurementMessage]);

  useEffect(() => {
    if (settingsMessage) {
      const timer = setTimeout(() => setSettingsMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [settingsMessage]);

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setSubPage('新增图书');
    setBookForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      isbn: book.isbn,
      price: book.price,
      category: book.category,
      coverUrl: book.coverUrl || '',
      description: book.description || '',
      stock: book.stock,
      publishDate: book.publishDate ? book.publishDate.slice(0, 10) : '',
    });
  };

  const handleDelete = async (id: string) => {
    setBookError(null);
    setBookMessage(null);
    setBookSubmitting(true);
    try {
      await deleteBook(id);
      setBookMessage('已删除');
      await onReloadBooks();
      await loadCategories();
    } catch (err) {
      setBookError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setBookSubmitting(false);
    }
  };

  const handleSaveBook = async () => {
    setBookError(null);
    setBookMessage(null);
    setBookSubmitting(true);
    try {
      if (editingId) {
        await updateBook(editingId, bookForm);
        setBookMessage('更新成功');
      } else {
        await createBook(bookForm);
        setBookMessage('新增成功');
      }
      setBookForm(emptyForm);
      setEditingId(null);
      if (onBookCreated) onBookCreated();
      await onReloadBooks();
      await loadCategories();
    } catch (err) {
      setBookError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setBookSubmitting(false);
    }
  };

  const categoryOptions = categories.map((c) => c.category || '').filter(Boolean);

  const handleCreateProcurement = async () => {
    setProcurementError(null);
    setProcurementMessage(null);
    setProcurementSubmitting(true);
    try {
      if (!procurementForm.bookId || !procurementForm.supplierId || procurementForm.quantity <= 0) {
        throw new Error('请选择书籍、供应商并填写数量');
      }
      await createProcurement({
        bookId: procurementForm.bookId,
        supplierId: procurementForm.supplierId,
        quantity: procurementForm.quantity,
        expectedDate: procurementForm.expectedDate || undefined,
        note: procurementForm.note || undefined,
        status: 'ordered',
      });
      setProcurementMessage('采购单已创建');
      setProcurementForm({ bookId: '', supplierId: '', quantity: 1, expectedDate: '', note: '' });
      await loadProcurements();
    } catch (err) {
      setProcurementError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setProcurementSubmitting(false);
    }
  };

  const handleSaveSupplier = async () => {
    setSupplierError(null);
    setSupplierMessage(null);
    setSupplierSubmitting(true);
    try {
      if (!supplierForm.name.trim()) {
        throw new Error('请填写供应商名称');
      }
      const payload = {
        name: supplierForm.name.trim(),
        contact: supplierForm.contact.trim() || undefined,
        phone: supplierForm.phone.trim() || undefined,
        email: supplierForm.email.trim() || undefined,
        rating: supplierForm.rating ? Number(supplierForm.rating) : undefined,
        note: supplierForm.note.trim() || undefined,
      };
      if (supplierForm.id) {
        await updateSupplier(supplierForm.id, payload);
        setSupplierMessage('供应商已更新');
      } else {
        await createSupplier(payload);
        setSupplierMessage('供应商已创建');
      }
      setSupplierForm({ id: '', name: '', contact: '', phone: '', email: '', rating: '', note: '' });
      await loadSuppliers();
    } catch (err) {
      setSupplierError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSupplierSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    setSupplierError(null);
    setSupplierMessage(null);
    try {
      await deleteSupplier(id);
      setSupplierMessage('供应商已删除');
      await loadSuppliers();
    } catch (err) {
      setSupplierError(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F2EB] text-[#2C2A26] overflow-hidden">
      <aside className="w-64 bg-[#2C2A26] text-[#F5F2EB] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-serif font-bold">呓语后台</h1>
          <p className="text-xs text-white/50 mt-1">Status: Online</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {modules.map(mod => (
            <div key={mod.id}>
              <button
                onClick={() => { setActiveModule(mod.id); setSubPage(subPages[mod.id]?.[0] || ''); }}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${activeModule === mod.id ? 'bg-[#F5F2EB] text-[#2C2A26]' : 'hover:bg-white/5 text-[#A8A29E]'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={mod.icon} />
                </svg>
                {mod.label}
              </button>
              {activeModule === mod.id && subPages[mod.id] && (
                <div className="bg-[#1F1D1A] py-2">
                  {subPages[mod.id].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSubPage(sub)}
                      className={`w-full text-left pl-14 pr-6 py-2 text-xs transition-colors ${subPage === sub ? 'text-white font-bold' : 'text-[#A8A29E] hover:text-white'}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={onExit} className="flex items-center gap-2 text-sm text-[#A8A29E] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            返回前台
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-[#D6D1C7] flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-medium">{subPage || modules.find(m => m.id === activeModule)?.label}</h2>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-100 text-xs text-gray-500 rounded-full">
              数据库已连接
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {activeModule === 'books' && subPage === '图书列表' && (
            <div className="bg-white border border-[#D6D1C7] p-6 shadow-sm animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-serif">全部图书</h3>
                <div className="flex gap-2">
                  <button
                    onClick={onReloadBooks}
                    className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]"
                  >
                    刷新
                  </button>
                  <button
                    onClick={() => { setSubPage('新增图书'); setEditingId(null); setBookForm(emptyForm); }}
                    className="px-3 py-2 bg-[#2C2A26] text-[#F5F2EB] text-sm hover:bg-[#433E38]"
                  >
                    新增
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">书名</th>
                      <th className="px-3 py-2">作者</th>
                      <th className="px-3 py-2">分类</th>
                      <th className="px-3 py-2">价格</th>
                      <th className="px-3 py-2">库存</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map(book => (
                      <tr key={book.id} className="border-b border-[#F0ECE3]">
                        <td className="px-3 py-2">{book.title}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{book.author}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{book.category}</td>
                        <td className="px-3 py-2">¥ {Number(book.price).toFixed(2)}</td>
                        <td className="px-3 py-2">{book.stock}</td>
                        <td className="px-3 py-2 space-x-2">
                          <button onClick={() => handleEdit(book)} className="text-xs px-3 py-1 border border-[#2C2A26] hover:bg-[#EBE7DE]">编辑</button>
                          <button onClick={() => handleDelete(book.id)} disabled={bookSubmitting} className="text-xs px-3 py-1 border border-red-800 text-red-800 hover:bg-red-50 disabled:opacity-50">删除</button>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-[#5D5A53]" colSpan={6}>暂无图书</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'books' && subPage === '新增图书' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full">
              <h3 className="text-xl font-serif text-[#2C2A26] mb-4">{editingId ? '编辑图书' : '新增图书'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">书名</label>
                    <input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">作者</label>
                    <input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">出版社</label>
                      <input value={bookForm.publisher} onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">ISBN</label>
                      <input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">定价</label>
                      <input type="number" value={bookForm.price} onChange={(e) => setBookForm({ ...bookForm, price: Number(e.target.value) })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">库存</label>
                      <input type="number" value={bookForm.stock} onChange={(e) => setBookForm({ ...bookForm, stock: Number(e.target.value) })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">分类</label>
                      <input list="categories" value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                      <datalist id="categories">
                        {categoryOptions.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">出版日期</label>
                      <input type="date" value={bookForm.publishDate} onChange={(e) => setBookForm({ ...bookForm, publishDate: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">封面 URL</label>
                    <input value={bookForm.coverUrl} onChange={(e) => setBookForm({ ...bookForm, coverUrl: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">内容描述</label>
                    <textarea value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26] h-32 resize-none" />
                  </div>
                  {bookMessage && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3">{bookMessage}</div>}
                  {bookError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{bookError}</div>}
                  <div className="flex justify-end gap-2">
                    {editingId && (
                      <button
                        onClick={() => { setEditingId(null); setBookForm(emptyForm); }}
                        className="px-6 py-3 border border-[#2C2A26] text-[#2C2A26] hover:bg-[#EBE7DE]"
                      >
                        取消编辑
                      </button>
                    )}
                    <button
                      disabled={bookSubmitting}
                      onClick={handleSaveBook}
                      className="px-6 py-3 bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookSubmitting ? '保存中…' : editingId ? '保存修改' : '保存图书'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'books' && subPage === '库存预警' && (
            <div className="bg-white border border-[#D6D1C7] p-6 shadow-sm animate-fade-in-up space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-serif">库存预警</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#5D5A53]">阈值</span>
                    <input
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-20 border border-[#D6D1C7] px-2 py-1"
                    />
                    <button
                      onClick={() => loadLowStock(threshold)}
                      className="px-3 py-2 bg-[#2C2A26] text-[#F5F2EB] text-xs hover:bg-[#433E38]"
                    >
                      刷新
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => loadLowStock(threshold)}
                  className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]"
                >
                  重新加载
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">书名</th>
                      <th className="px-3 py-2">作者</th>
                      <th className="px-3 py-2">分类</th>
                      <th className="px-3 py-2">库存</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map(book => (
                      <tr key={book.id} className="border-b border-[#F0ECE3]">
                        <td className="px-3 py-2">{book.title}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{book.author}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{book.category}</td>
                        <td className="px-3 py-2 text-red-700 font-semibold">{book.stock}</td>
                      </tr>
                    ))}
                    {lowStock.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-[#5D5A53]">暂无低库存图书</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'books' && subPage === '基础数据管理' && (
            <div className="bg-white border border-[#D6D1C7] p-6 shadow-sm animate-fade-in-up space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">分类管理</h3>
                <button
                  onClick={loadCategories}
                  className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]"
                >
                  刷新
                </button>
              </div>
              {catError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{catError}</div>}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((c, idx) => (
                  <div key={`${c.category}-${idx}`} className="border border-[#D6D1C7] p-3 bg-[#F9F8F6]">
                    <div className="text-sm font-semibold text-[#2C2A26]">{c.category || '未分类'}</div>
                    <div className="text-xs text-[#5D5A53] mt-1">书目数量：{c.count}</div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="col-span-full text-center text-[#5D5A53]">暂无分类数据</div>
                )}
              </div>
              <p className="text-xs text-[#A8A29E]">提示：分类来自已录入图书的分类字段，要新增分类可在“新增图书”时直接输入。</p>
            </div>
          )}

          {activeModule === 'orders' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">订单发货</h3>
                <div className="flex gap-2">
                  <button onClick={loadOrders} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
                </div>
              </div>
              {ordersLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {ordersError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{ordersError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">订单号</th>
                      <th className="px-3 py-2">用户</th>
                      <th className="px-3 py-2">金额</th>
                      <th className="px-3 py-2">状态</th>
                      <th className="px-3 py-2">收件人</th>
                      <th className="px-3 py-2">商品</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-[#F0ECE3]">
                        <td className="px-3 py-2">{order.id}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{(order as any).user?.name || '游客'}</td>
                        <td className="px-3 py-2">¥ {Number(order.total).toFixed(2)}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">
                          <span className="px-2 py-1 rounded text-xs bg-[#F5F2EB] border border-[#E5E2DA]">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#5D5A53]">{order.contactName}</td>
                        <td className="px-3 py-2 text-[#5D5A53] max-w-xs">
                          {order.items?.map((it) => it.book?.title).filter(Boolean).join('，') || '--'}
                        </td>
                        <td className="px-3 py-2">
                          <select
                            defaultValue={order.status}
                            onChange={async (e) => {
                              const next = e.target.value as Order['status'];
                              try {
                                await updateOrderStatus(order.id, next);
                                await loadOrders();
                              } catch (err) {
                                setOrdersError(err instanceof Error ? err.message : '更新失败');
                              }
                            }}
                            className="border border-[#D6D1C7] bg-[#F9F8F6] px-3 py-1.5 text-sm rounded-sm shadow-sm hover:border-[#2C2A26] focus:border-[#2C2A26] focus:outline-none"
                          >
                            <option value="pending">待处理</option>
                            <option value="processing">处理中</option>
                            <option value="shipped">已发货</option>
                            <option value="completed">已完成</option>
                            <option value="cancelled">已取消</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-[#5D5A53]">暂无订单</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'customers' && subPage === '客户列表' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">客户列表</h3>
                <button onClick={loadCustomers} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
              </div>
              {customerLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {customerError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{customerError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">姓名</th>
                      <th className="px-3 py-2">邮箱</th>
                      <th className="px-3 py-2">角色</th>
                      <th className="px-3 py-2">余额</th>
                      <th className="px-3 py-2">信用等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-[#F0ECE3]">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.email}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.role}</td>
                        <td className="px-3 py-2">¥ {Number(c.balance).toFixed(2)}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.creditLevel || '--'}</td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-[#5D5A53]">暂无客户</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'customers' && subPage === '信用管理' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">信用管理</h3>
                <button onClick={loadCustomers} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
              </div>
              {customerLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {customerError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{customerError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">姓名</th>
                      <th className="px-3 py-2">邮箱</th>
                      <th className="px-3 py-2">角色</th>
                      <th className="px-3 py-2">当前信用</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-[#F0ECE3]">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.email}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.role}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.creditLevel || '--'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="新的信用等级"
                              className="w-32 border border-[#D6D1C7] px-2 py-1 text-xs"
                              onBlur={async (e) => {
                                const value = e.target.value.trim();
                                if (!value) return;
                                try {
                                  await updateCustomerCredit(c.id, value);
                                  await loadCustomers();
                                } catch (err) {
                                  setCustomerError(err instanceof Error ? err.message : '更新失败');
                                } finally {
                                  e.target.value = '';
                                }
                              }}
                            />
                            <span className="text-xs text-[#5D5A53]">离开输入框即更新</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-[#5D5A53]">暂无客户</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'customers' && subPage === '余额调整' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">余额调整</h3>
                <button onClick={loadCustomers} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
              </div>
              {customerLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {customerError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{customerError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">姓名</th>
                      <th className="px-3 py-2">邮箱</th>
                      <th className="px-3 py-2">当前余额</th>
                      <th className="px-3 py-2">调整</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-[#F0ECE3]">
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-[#5D5A53]">{c.email}</td>
                        <td className="px-3 py-2">¥ {Number(c.balance).toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="正数充值 负数扣减"
                              step="0.01"
                              className="w-40 border border-[#D6D1C7] px-2 py-1 text-xs"
                              onBlur={async (e) => {
                                if (!e.target.value) return;
                                const val = Number(e.target.value);
                                try {
                                  await updateCustomerBalance(c.id, val);
                                  await loadCustomers();
                                } catch (err) {
                                  setCustomerError(err instanceof Error ? err.message : '更新失败');
                                } finally {
                                  e.target.value = '';
                                }
                              }}
                            />
                            <span className="text-xs text-[#5D5A53]">失焦即生效</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-[#5D5A53]">暂无客户</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'purchase' && (subPage === '采购单' || subPage === '到货处理') && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">{subPage === '到货处理' ? '到货处理' : '采购单'}</h3>
                <div className="flex gap-2">
                  <button onClick={() => loadProcurements()} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
                </div>
              </div>

              {subPage === '采购单' && (
                <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#5D5A53] mb-1">书籍</label>
                    <select
                      value={procurementForm.bookId}
                      onChange={(e) => setProcurementForm({ ...procurementForm, bookId: e.target.value })}
                      className="w-full border border-[#D6D1C7] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">选择书籍</option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5D5A53] mb-1">供应商</label>
                    <select
                      value={procurementForm.supplierId}
                      onChange={(e) => setProcurementForm({ ...procurementForm, supplierId: e.target.value })}
                      className="w-full border border-[#D6D1C7] bg-white px-3 py-2 text-sm"
                    >
                      <option value="">选择供应商</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5D5A53] mb-1">数量</label>
                    <input
                      type="number"
                      min={1}
                      value={procurementForm.quantity}
                      onChange={(e) => setProcurementForm({ ...procurementForm, quantity: Number(e.target.value) })}
                      className="w-full border border-[#D6D1C7] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5D5A53] mb-1">预计到货</label>
                    <input
                      type="date"
                      value={procurementForm.expectedDate}
                      onChange={(e) => setProcurementForm({ ...procurementForm, expectedDate: e.target.value })}
                      className="w-full border border-[#D6D1C7] px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-semibold text-[#5D5A53] mb-1">备注</label>
                    <textarea
                      value={procurementForm.note}
                      onChange={(e) => setProcurementForm({ ...procurementForm, note: e.target.value })}
                      className="w-full border border-[#D6D1C7] px-3 py-2 text-sm h-20 bg-white"
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2">
                    {procurementMessage && <span className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2">{procurementMessage}</span>}
                    {procurementError && <span className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">{procurementError}</span>}
                    <button
                      disabled={procurementSubmitting}
                      onClick={handleCreateProcurement}
                      className="px-5 py-2 bg-[#2C2A26] text-[#F5F2EB] text-sm hover:bg-[#433E38] disabled:opacity-50"
                    >
                      {procurementSubmitting ? '创建中...' : '创建采购单'}
                    </button>
                  </div>
                </div>
              )}

              {procurementLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {procurementError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{procurementError}</div>}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">书名</th>
                      <th className="px-3 py-2">供应商</th>
                      <th className="px-3 py-2">数量</th>
                      <th className="px-3 py-2">预计到货</th>
                      <th className="px-3 py-2">状态</th>
                      <th className="px-3 py-2">创建时间</th>
                      <th className="px-3 py-2">备注</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(subPage === '到货处理' ? filteredProcurements : procurements).map((p) => (
                      <tr key={p.id} className="border-b border-[#F0ECE3] align-middle">
                        <td className="px-3 py-3">{p.book?.title || '--'}</td>
                        <td className="px-3 py-3 text-[#5D5A53]">{p.supplier?.name || '--'}</td>
                        <td className="px-3 py-3">{p.quantity}</td>
                        <td className="px-3 py-3 text-[#5D5A53]">{p.expectedDate ? new Date(p.expectedDate).toLocaleDateString() : '--'}</td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-1 rounded text-xs bg-[#F5F2EB] border border-[#E5E2DA] inline-block min-w-[72px] capitalize">
                            {p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[#5D5A53]">{new Date(p.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-3 text-[#5D5A53] max-w-xs">{p.note || '--'}</td>
                        <td className="px-3 py-3">
                          <select
                            defaultValue={p.status}
                            onChange={async (e) => {
                              const next = e.target.value as ProcurementStatus;
                              try {
                                await updateProcurementStatus(p.id, next);
                                await loadProcurements();
                              } catch (err) {
                                setProcurementError(err instanceof Error ? err.message : '更新失败');
                              }
                            }}
                            className="border border-[#D6D1C7] bg-[#F9F8F6] px-2 py-1 text-sm rounded-sm focus:border-[#2C2A26] focus:outline-none"
                          >
                            <option value="open">待下单</option>
                            <option value="ordered">已下单</option>
                            <option value="received">已到货</option>
                            <option value="cancelled">已取消</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {(subPage === '到货处理' ? filteredProcurements : procurements).length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-[#5D5A53]">暂无采购单</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeModule === 'supplier' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">{subPage === '新增供应商' ? '新增供应商' : '供应商列表'}</h3>
                <div className="flex gap-2">
                  <button onClick={loadSuppliers} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
                  <button
                    onClick={() => { setSubPage('新增供应商'); setSupplierForm({ id: '', name: '', contact: '', phone: '', email: '', rating: '', note: '' }); }}
                    className="px-3 py-2 bg-[#2C2A26] text-[#F5F2EB] text-sm hover:bg-[#433E38]"
                  >
                    新增
                  </button>
                </div>
              </div>

              {supplierMessage && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3">{supplierMessage}</div>}
              {supplierError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{supplierError}</div>}
              {supplierLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}

              {subPage === '供应商列表' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#F5F2EB] text-left">
                      <tr>
                        <th className="px-3 py-2">名称</th>
                        <th className="px-3 py-2">联系人</th>
                        <th className="px-3 py-2">电话</th>
                        <th className="px-3 py-2">邮箱</th>
                        <th className="px-3 py-2">评级</th>
                        <th className="px-3 py-2">备注</th>
                        <th className="px-3 py-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((s) => (
                        <tr key={s.id} className="border-b border-[#F0ECE3] align-middle">
                          <td className="px-3 py-3">{s.name}</td>
                          <td className="px-3 py-3 text-[#5D5A53]">{s.contact || '--'}</td>
                          <td className="px-3 py-3 text-[#5D5A53]">{s.phone || '--'}</td>
                        <td className="px-3 py-3 text-[#5D5A53]">{s.email || '--'}</td>
                        <td className="px-3 py-3 text-[#5D5A53]">{s.rating ?? '--'}</td>
                        <td className="px-3 py-3 text-[#5D5A53] max-w-xs">{s.note || '--'}</td>
                        <td className="px-3 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSupplierForm({
                                    id: s.id,
                                    name: s.name || '',
                                    contact: s.contact || '',
                                    phone: s.phone || '',
                                    email: s.email || '',
                                    rating: s.rating?.toString() || '',
                                    note: s.note || '',
                                  });
                                  setSubPage('新增供应商');
                                }}
                                className="text-xs px-3 py-1 border border-[#2C2A26] hover:bg-[#EBE7DE]"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDeleteSupplier(s.id)}
                                className="text-xs px-3 py-1 border border-red-700 text-red-700 hover:bg-red-50"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {suppliers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-center text-[#5D5A53]">暂无供应商</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {subPage === '新增供应商' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">名称 *</label>
                      <input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">联系人</label>
                      <input value={supplierForm.contact} onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">电话</label>
                        <input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">邮箱</label>
                        <input value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">评级</label>
                        <input type="number" min={0} max={5} value={supplierForm.rating} onChange={(e) => setSupplierForm({ ...supplierForm, rating: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26]" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#5D5A53] uppercase mb-1">备注</label>
                      <textarea value={supplierForm.note} onChange={(e) => setSupplierForm({ ...supplierForm, note: e.target.value })} className="w-full border border-[#D6D1C7] p-3 outline-none focus:border-[#2C2A26] h-32 resize-none" />
                    </div>
                    <div className="flex justify-end gap-2">
                      {supplierForm.id && (
                        <button
                          onClick={() => setSupplierForm({ id: '', name: '', contact: '', phone: '', email: '', rating: '', note: '' })}
                          className="px-6 py-3 border border-[#2C2A26] text-[#2C2A26] hover:bg-[#EBE7DE]"
                        >
                          取消编辑
                        </button>
                      )}
                      <button
                        disabled={supplierSubmitting}
                        onClick={handleSaveSupplier}
                        className="px-6 py-3 bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {supplierSubmitting ? '保存中...' : supplierForm.id ? '保存修改' : '保存供应商'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeModule === 'stats' && subPage === '销售统计' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">销售统计</h3>
                <button onClick={loadStats} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
              </div>
              {statsLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {statsError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{statsError}</div>}
              {stats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                      <p className="text-xs text-[#5D5A53]">总销售额</p>
                      <p className="text-2xl font-serif text-[#2C2A26] mt-2">¥ {stats.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                      <p className="text-xs text-[#5D5A53]">订单数</p>
                      <p className="text-2xl font-serif text-[#2C2A26] mt-2">{stats.orderCount}</p>
                    </div>
                    <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                      <p className="text-xs text-[#5D5A53]">用户数</p>
                      <p className="text-2xl font-serif text-[#2C2A26] mt-2">{stats.userCount}</p>
                    </div>
                    <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                      <p className="text-xs text-[#5D5A53]">图书数</p>
                      <p className="text-2xl font-serif text-[#2C2A26] mt-2">{stats.bookCount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 border border-[#E7E3DB] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-serif text-[#2C2A26]">近6个月销售额</h4>
                        <span className="text-xs text-[#A8A29E]">单位：元</span>
                      </div>
                      <div className="space-y-2">
                        {stats.monthly.map((m) => {
                          const max = Math.max(...stats.monthly.map((x) => x.total), 1);
                          const width = `${Math.min(100, (m.total / max) * 100)}%`;
                          return (
                            <div key={m.month}>
                              <div className="flex justify-between text-xs text-[#5D5A53]">
                                <span>{m.month}</span>
                                <span>¥ {m.total.toFixed(2)}</span>
                              </div>
                              <div className="h-2 bg-[#F5F2EB] border border-[#E7E3DB]">
                                <div className="h-2 bg-[#2C2A26]" style={{ width }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-[#E7E3DB] p-4">
                      <h4 className="text-lg font-serif text-[#2C2A26] mb-3">订单状态</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.statusCounts).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm text-[#5D5A53]">
                            <span className="capitalize">{k}</span>
                            <span className="font-semibold text-[#2C2A26]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeModule === 'stats' && subPage === '热销排行' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">热销分析</h3>
                <button onClick={loadStats} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
              </div>
              {statsLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {statsError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{statsError}</div>}
              {stats && (
                <>
                  {stats.topBooks.length > 0 ? (
                    <div className="space-y-6">
                      {/* 王座前三名 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['silver', 'gold', 'bronze'].map((tier, idx) => {
                          const order = tier === 'gold' ? 0 : tier === 'silver' ? 1 : 2;
                          const item = stats.topBooks[order];
                          if (!item) return <div key={tier} className="border border-dashed border-[#E7E3DB] p-4 text-center text-[#A8A29E]">空缺</div>;
                          const colors = {
                            gold: { bg: 'from-amber-100 to-amber-50', text: '#B45309', crown: '#FBBF24' },
                            silver: { bg: 'from-slate-100 to-slate-50', text: '#475569', crown: '#94A3B8' },
                            bronze: { bg: 'from-orange-100 to-amber-50', text: '#B45309', crown: '#D97706' },
                          } as any;
                          const rankLabel = tier === 'gold' ? 'NO.1' : tier === 'silver' ? 'NO.2' : 'NO.3';
                          return (
                            <div
                              key={tier}
                              className={`relative border border-[#E7E3DB] bg-gradient-to-b ${colors[tier].bg} p-5 flex flex-col items-center text-center shadow-sm`}
                            >
                              <div className="absolute -top-5">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors[tier].crown} className="w-8 h-8 drop-shadow">
                                  <path d="M5 5l2.5 5 4.5-6 4.5 6L19 5l1 14H4z" />
                                </svg>
                              </div>
                              <div className="mt-4 text-xs tracking-widest text-[#A8A29E]">{rankLabel}</div>
                              <div className="text-lg font-serif text-[#2C2A26] mt-1">{item.title}</div>
                              <div className="mt-3 flex items-center gap-3 text-sm text-[#5D5A53]">
                                <span className="px-3 py-1 bg-white/70 border border-[#E7E3DB] rounded-full">销量 {item.sold}</span>
                                <span className="px-3 py-1 bg-white/70 border border-[#E7E3DB] rounded-full">¥ {item.revenue.toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 榜单列表 */}
                      <div className="border border-[#E7E3DB]">
                        <div className="bg-[#F5F2EB] px-4 py-3 flex justify-between text-sm font-semibold text-[#2C2A26]">
                          <span>排行榜</span>
                          <span className="text-[#5D5A53]">销量 / 销售额</span>
                        </div>
                        <div className="divide-y divide-[#F0ECE3]">
                          {stats.topBooks.map((b, idx) => (
                            <div key={`${b.title}-${idx}`} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${idx < 3 ? 'bg-[#2C2A26] text-[#F5F2EB]' : 'bg-[#F5F2EB] text-[#2C2A26]'}`}>
                                  {idx + 1}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-[#2C2A26]">{b.title}</p>
                                  <p className="text-xs text-[#A8A29E]">销量 {b.sold}</p>
                                </div>
                              </div>
                              <div className="text-sm text-[#5D5A53] font-semibold">¥ {b.revenue.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-[#5D5A53] py-10">暂无数据</div>
                  )}
                </>
              )}
            </div>
          )}

          {activeModule === 'stats' && subPage === '库存分析' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">库存分析</h3>
                <div className="flex gap-2">
                  <button onClick={() => loadLowStock(threshold)} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新低库存</button>
                  <button onClick={loadCategories} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新分类</button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border border-[#E7E3DB] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-serif text-[#2C2A26]">低库存</h4>
                    <div className="flex items-center gap-2 text-sm text-[#5D5A53]">
                      <span>阈值</span>
                      <input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="w-20 border border-[#D6D1C7] px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#F5F2EB] text-left">
                        <tr>
                          <th className="px-3 py-2">书名</th>
                          <th className="px-3 py-2">作者</th>
                          <th className="px-3 py-2">分类</th>
                          <th className="px-3 py-2">库存</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStock.map((book) => (
                          <tr key={book.id} className="border-b border-[#F0ECE3]">
                            <td className="px-3 py-2">{book.title}</td>
                            <td className="px-3 py-2 text-[#5D5A53]">{book.author}</td>
                            <td className="px-3 py-2 text-[#5D5A53]">{book.category}</td>
                            <td className="px-3 py-2 text-red-700 font-semibold">{book.stock}</td>
                          </tr>
                        ))}
                        {lowStock.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-6 text-center text-[#5D5A53]">暂无低库存图书</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border border-[#E7E3DB] p-4">
                  <h4 className="text-lg font-serif text-[#2C2A26] mb-3">分类占比</h4>
                  <div className="space-y-2">
                    {categories.map((c, idx) => (
                      <div key={`${c.category}-${idx}`} className="flex justify-between text-sm text-[#5D5A53]">
                        <span>{c.category || '未分类'}</span>
                        <span className="font-semibold text-[#2C2A26]">{c.count}</span>
                      </div>
                    ))}
                    {categories.length === 0 && <p className="text-sm text-[#5D5A53]">暂无分类数据</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'settings' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">系统设置</h3>
                <button
                  onClick={() => {
                    localStorage.removeItem('yiyu_token');
                    localStorage.removeItem('yiyu_user');
                    setSettingsMessage('本地缓存已清理');
                  }}
                  className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]"
                >
                  清理本地缓存
                </button>
              </div>
              {settingsMessage && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3">{settingsMessage}</div>}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4 lg:col-span-2">
                  <h4 className="text-lg font-serif text-[#2C2A26] mb-4">运行策略</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-[#D6D1C7] p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#2C2A26]">维护模式</p>
                          <p className="text-xs text-[#5D5A53] mt-1">启用后仅管理员可访问</p>
                        </div>
                        <button
                          onClick={() => setSettingsForm({ ...settingsForm, maintenance: !settingsForm.maintenance })}
                          className={`px-4 py-2 text-xs border ${settingsForm.maintenance ? 'bg-[#2C2A26] text-[#F5F2EB]' : 'bg-white text-[#2C2A26]'}`}
                        >
                          {settingsForm.maintenance ? '已开启' : '未开启'}
                        </button>
                      </div>
                    </div>
                    <div className="border border-[#D6D1C7] p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#2C2A26]">异常通知</p>
                          <p className="text-xs text-[#5D5A53] mt-1">接口异常时通知管理员</p>
                        </div>
                        <button
                          onClick={() => setSettingsForm({ ...settingsForm, notifyAdmin: !settingsForm.notifyAdmin })}
                          className={`px-4 py-2 text-xs border ${settingsForm.notifyAdmin ? 'bg-[#2C2A26] text-[#F5F2EB]' : 'bg-white text-[#2C2A26]'}`}
                        >
                          {settingsForm.notifyAdmin ? '已开启' : '未开启'}
                        </button>
                      </div>
                    </div>
                    <div className="border border-[#D6D1C7] p-4 bg-white md:col-span-2">
                      <p className="text-sm font-medium text-[#2C2A26] mb-2">日志等级</p>
                      <div className="flex gap-2">
                        {['error', 'warn', 'info', 'debug'].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setSettingsForm({ ...settingsForm, logLevel: lvl })}
                            className={`px-4 py-2 text-xs border ${settingsForm.logLevel === lvl ? 'bg-[#2C2A26] text-[#F5F2EB]' : 'bg-white text-[#2C2A26]'}`}
                          >
                            {lvl.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setSettingsMessage('设置已保存（本地示意）')}
                      className="px-6 py-3 bg-[#2C2A26] text-[#F5F2EB] text-sm hover:bg-[#433E38]"
                    >
                      保存设置
                    </button>
                  </div>
                </div>

                <div className="border border-[#E7E3DB] p-4 bg-[#F9F8F6]">
                  <h4 className="text-lg font-serif text-[#2C2A26] mb-3">系统信息</h4>
                  <div className="space-y-2 text-sm text-[#5D5A53]">
                    <div className="flex justify-between">
                      <span>API 地址</span>
                      <span className="text-[#2C2A26] max-w-[180px] text-right break-all">{API_BASE_URL || '未配置'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>前端版本</span>
                      <span className="text-[#2C2A26]">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>状态</span>
                      <span className="text-green-700">正常</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-[#A8A29E] leading-relaxed">
                    若需调整后端配置，请修改环境变量并重启服务；此处设置为前端示意。
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'dashboard' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-serif text-[#2C2A26]">仪表盘</h3>
                  <p className="text-sm text-[#5D5A53]">仅展示关键数据，修改请前往对应功能页。</p>
                </div>
                <button onClick={() => { loadStats(); loadLowStock(threshold); loadOrders(); }} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新数据</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                  <p className="text-xs text-[#5D5A53]">总销售额</p>
                  <p className="text-2xl font-serif text-[#2C2A26] mt-2">¥ {stats?.totalSales.toFixed(2) ?? '--'}</p>
                </div>
                <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                  <p className="text-xs text-[#5D5A53]">订单数</p>
                  <p className="text-2xl font-serif text-[#2C2A26] mt-2">{stats?.orderCount ?? '--'}</p>
                </div>
                <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                  <p className="text-xs text-[#5D5A53]">用户数</p>
                  <p className="text-2xl font-serif text-[#2C2A26] mt-2">{stats?.userCount ?? '--'}</p>
                </div>
                <div className="border border-[#E7E3DB] bg-[#F9F8F6] p-4">
                  <p className="text-xs text-[#5D5A53]">图书数</p>
                  <p className="text-2xl font-serif text-[#2C2A26] mt-2">{stats?.bookCount ?? '--'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border border-[#E7E3DB] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-serif text-[#2C2A26]">近6个月销售额</h4>
                    <span className="text-xs text-[#A8A29E]">单位：元</span>
                  </div>
                  {stats?.monthly ? (
                    <div className="space-y-2">
                      {stats.monthly.map((m) => {
                        const max = Math.max(...stats.monthly.map((x) => x.total), 1);
                        const width = `${Math.min(100, (m.total / max) * 100)}%`;
                        return (
                          <div key={m.month}>
                            <div className="flex justify-between text-xs text-[#5D5A53]">
                              <span>{m.month}</span>
                              <span>¥ {m.total.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-[#F5F2EB] border border-[#E7E3DB]">
                              <div className="h-2 bg-[#2C2A26]" style={{ width }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[#5D5A53]">暂无数据</p>
                  )}
                </div>
                <div className="border border-[#E7E3DB] p-4">
                  <h4 className="text-lg font-serif text-[#2C2A26] mb-3">订单状态</h4>
                  <div className="space-y-2">
                    {stats?.statusCounts
                      ? Object.entries(stats.statusCounts).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm text-[#5D5A53]">
                            <span className="capitalize">{k}</span>
                            <span className="font-semibold text-[#2C2A26]">{v}</span>
                          </div>
                        ))
                      : <p className="text-sm text-[#5D5A53]">暂无数据</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-[#E7E3DB] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-serif text-[#2C2A26]">热销 TOP 3</h4>
                    <span className="text-xs text-[#A8A29E]">仅展示，修改请至库存/采购</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['gold','silver','bronze'].map((tier, idx) => {
                      const item = stats?.topBooks?.[tier==='gold'?0:tier==='silver'?1:2];
                      const colors = {
                        gold: { crown: '#FBBF24', bg: 'from-amber-100 to-amber-50' },
                        silver: { crown: '#94A3B8', bg: 'from-slate-100 to-slate-50' },
                        bronze: { crown: '#D97706', bg: 'from-orange-100 to-amber-50' },
                      } as any;
                      if (!item) return <div key={tier} className="border border-dashed border-[#E7E3DB] p-4 text-center text-[#A8A29E]">空缺</div>;
                      const label = tier==='gold'?'NO.1':tier==='silver'?'NO.2':'NO.3';
                      return (
                        <div key={tier} className={`relative border border-[#E7E3DB] bg-gradient-to-b ${colors[tier].bg} p-4 flex flex-col items-center text-center`}>
                          <div className="absolute -top-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors[tier].crown} className="w-7 h-7 drop-shadow">
                              <path d="M5 5l2.5 5 4.5-6 4.5 6L19 5l1 14H4z" />
                            </svg>
                          </div>
                          <div className="mt-3 text-xs tracking-widest text-[#A8A29E]">{label}</div>
                          <div className="text-base font-serif text-[#2C2A26] mt-1">{item.title}</div>
                          <div className="mt-2 text-xs text-[#5D5A53]">销量 {item.sold} · ¥ {item.revenue.toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-[#E7E3DB] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-serif text-[#2C2A26]">低库存预警</h4>
                    <span className="text-xs text-[#A8A29E]">阈值 {threshold}</span>
                  </div>
                  <div className="space-y-2">
                    {lowStock.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex justify-between text-sm text-[#5D5A53]">
                        <span className="truncate max-w-[60%]">{b.title}</span>
                        <span className="text-red-700 font-semibold">{b.stock}</span>
                      </div>
                    ))}
                    {lowStock.length === 0 && <p className="text-sm text-[#5D5A53]">暂无低库存</p>}
                  </div>
                </div>
              </div>

              <div className="border border-[#E7E3DB] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-serif text-[#2C2A26]">最近订单</h4>
                  <span className="text-xs text-[#A8A29E]">如需修改请前往“订单发货”</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#F5F2EB] text-left">
                      <tr>
                        <th className="px-3 py-2">订单号</th>
                        <th className="px-3 py-2">用户</th>
                        <th className="px-3 py-2">金额</th>
                        <th className="px-3 py-2">状态</th>
                        <th className="px-3 py-2">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="border-b border-[#F0ECE3]">
                          <td className="px-3 py-2">{o.id}</td>
                          <td className="px-3 py-2 text-[#5D5A53]">{o.userId || '游客'}</td>
                          <td className="px-3 py-2">¥ {Number(o.total).toFixed(2)}</td>
                          <td className="px-3 py-2 text-[#5D5A53] capitalize">{o.status}</td>
                          <td className="px-3 py-2 text-[#5D5A53]">{new Date(o.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-[#5D5A53]">暂无订单</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeModule === 'purchase' && subPage === '缺书登记' && (
            <div className="bg-white p-12 border border-[#D6D1C7] min-h-[400px] animate-fade-in-up w-full space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif">缺书登记</h3>
                <button onClick={loadRequests} className="px-3 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">刷新</button>
              </div>
              {requestLoading && <p className="text-sm text-[#5D5A53]">加载中...</p>}
              {requestError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{requestError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F5F2EB] text-left">
                    <tr>
                      <th className="px-3 py-2">书名</th>
                      <th className="px-3 py-2">作者</th>
                      <th className="px-3 py-2">提交人</th>
                      <th className="px-3 py-2">联系方式</th>
                      <th className="px-3 py-2">状态</th>
                      <th className="px-3 py-2">备注</th>
                      <th className="px-3 py-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookRequests.map((r) => (
                      <tr key={r.id} className="border-b border-[#F0ECE3] align-middle">
                        <td className="px-3 py-3 align-middle">{r.title}</td>
                        <td className="px-3 py-3 align-middle text-[#5D5A53]">{r.author || '--'}</td>
                        <td className="px-3 py-3 align-middle text-[#5D5A53]">
                          {r.user?.name || r.contactName || '—'}
                        </td>
                        <td className="px-3 py-3 align-middle text-[#5D5A53] text-xs">
                          {r.contactEmail || r.user?.email || '--'}
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <span className="px-2 py-1 rounded text-xs bg-[#F5F2EB] border border-[#E5E2DA] capitalize inline-block min-w-[72px]">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-middle text-[#5D5A53] max-w-xs">{r.note || '--'}</td>
                        <td className="px-3 py-3 align-middle">
                          <select
                            defaultValue={r.status}
                            onChange={async (e) => {
                              const next = e.target.value as MissingRequestStatus;
                              try {
                                await updateBookRequestStatus(r.id, next);
                                await loadRequests();
                              } catch (err) {
                                setRequestError(err instanceof Error ? err.message : '更新失败');
                              }
                            }}
                            className="border border-[#D6D1C7] px-2 py-1 text-sm"
                          >
                            <option value="open">待处理</option>
                            <option value="reviewing">审核中</option>
                            <option value="ordered">已下单</option>
                            <option value="stocked">已入库</option>
                            <option value="rejected">已拒绝</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {bookRequests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-[#5D5A53]">暂无缺书登记</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
