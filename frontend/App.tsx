/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import Auth from './components/Auth';
import UserCenter from './components/UserCenter';
import AdminPanel from './components/AdminPanel';
import { Book, ViewState, User, Favorite } from './types';
import { fetchBooks, fetchMe, fetchFavorites, addFavorite, removeFavorite } from './services/api';

function App() {
  const TOKEN_KEY = 'yiyu_token';
  const USER_KEY = 'yiyu_user';
  const normalizeUser = (raw: any): User => {
    if (!raw) return raw;
    return {
      ...raw,
      balance: Number(raw.balance ?? 0),
      creditLevel: raw.creditLevel ?? '白银',
      phone: raw.phone || '',
      avatar: raw.avatar || '',
    };
  };
  const normalizeBook = (raw: any): Book => {
    return {
      ...raw,
      price: Number(raw.price ?? 0),
      stock: Number(raw.stock ?? 0),
    };
  };
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [cartItems, setCartItems] = useState<Book[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadBooks = async () => {
    setBooksLoading(true);
    setBooksError(null);
    try {
      const data = await fetchBooks();
      setBooks(data.map(normalizeBook));
    } catch (error) {
      setBooks([]);
      setBooksError(error instanceof Error ? error.message : '无法获取图书数据');
    } finally {
      setBooksLoading(false);
    }
  };

  const loadFavorites = async (nextUser?: User | null) => {
    const targetUser = nextUser ?? user;
    if (!targetUser) {
      setFavorites([]);
      return;
    }
    try {
      const data = await fetchFavorites();
      setFavorites(data.map((f) => ({ ...f, book: normalizeBook(f.book) })));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const remote = await fetchMe();
      const normalized = normalizeUser(remote);
      setUser(normalized);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
      await loadFavorites(normalized);
    } catch (err) {
      // Ignore refresh errors; likely unauthorized/expired
      console.error(err);
    }
  };

  const recommendedBooks = useMemo(() => {
    if (!books.length) return [];
    const hash = (str: string) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      return h;
    };
    return [...books]
      .sort((a, b) => (hash(todayKey + a.id + a.title) - hash(todayKey + b.id + b.title)))
      .slice(0, 4);
  }, [books, todayKey]);

  useEffect(() => {
    loadBooks();
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    refreshUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites(user);
    } else {
      setFavorites([]);
      setIsFavoritesOpen(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (view.type === 'user-center') {
      refreshUser();
    }
  }, [view.type]);

  const handleNavClick = (target: string) => {
    if (target === 'home') setView({ type: 'home' });
    if (target === 'books') setView({ type: 'book-list' });
    if (target === 'login') setView({ type: 'auth', mode: 'login' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (sessionUser: User, token: string) => {
    const normalized = normalizeUser(sessionUser);
    setUser(normalized);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    loadFavorites(normalized);
    setView({ type: 'home' });
  };

  const handleLogout = () => {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setFavorites([]);
      setIsFavoritesOpen(false);
      setView({ type: 'home' });
  };

  const addToCart = (book: Book) => {
    setCartItems([...cartItems, normalizeBook(book)]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
  };

  const openFavorites = () => {
    if (!user) {
      setView({ type: 'auth', mode: 'login' });
      return;
    }
    setIsFavoritesOpen(true);
  };

  const toggleFavorite = async (book: Book) => {
    if (!user) {
      setView({ type: 'auth', mode: 'login' });
      return;
    }
    const existing = favorites.find((f) => f.bookId === book.id);
    try {
      if (existing) {
        await removeFavorite(book.id);
        setFavorites((prev) => prev.filter((f) => f.bookId !== book.id));
      } else {
        const created = await addFavorite(book.id);
        setFavorites((prev) => [{ ...created, book: normalizeBook(created.book) }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '操作失败，请稍后重试');
    }
  };

  const handleRemoveFavorite = async (bookId: string) => {
    try {
      await removeFavorite(bookId);
      setFavorites((prev) => prev.filter((f) => f.bookId !== bookId));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '操作失败，请稍后重试');
    }
  };

  const handleViewFavoriteBook = (book: Book) => {
    setIsFavoritesOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView({ type: 'book-detail', book });
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] font-sans text-[#2C2A26] selection:bg-[#D6D1C7] selection:text-[#2C2A26]">
      {/* Hide Navbar on Checkout or specific full screen pages if needed */}
      {view.type !== 'checkout' && view.type !== 'admin-panel' && (
        <Navbar 
            currentView={view.type}
            cartCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
            favoritesCount={favorites.length}
            onOpenFavorites={openFavorites}
            onNavClick={handleNavClick}
            user={user}
            onToUserCenter={() => setView({ type: 'user-center' })}
            onToAdminPanel={() => setView({ type: 'admin-panel' })}
            onLogout={handleLogout}
        />
      )}
      
      <main>
        {view.type === 'home' && (
          <>
            <Hero onExplore={() => setView({ type: 'book-list' })} />
            {/* Limit logic relies on data existing. If empty, it shows empty state. */}
            <BookList 
                limit={4} 
                title="今日推荐" 
                books={recommendedBooks}
                isLoading={booksLoading}
                error={booksError}
                onReload={loadBooks}
                onBookClick={(b) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setView({ type: 'book-detail', book: b });
                }} 
            />
             {/* Simple Banner */}
             <div className="py-20 px-6 bg-[#EBE7DE] text-center">
                <h3 className="text-2xl font-serif text-[#2C2A26] mb-4">阅读，是精神的呼吸。</h3>
                <p className="text-[#5D5A53]">我们在寻找那些能经过时间冲刷而留存下来的文字。</p>
            </div>
          </>
        )}

        {view.type === 'book-list' && (
            <div className="pt-24">
                <BookList 
                    title="全部藏书"
                    books={books}
                    isLoading={booksLoading}
                    error={booksError}
                    onReload={loadBooks}
                    onBookClick={(b) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setView({ type: 'book-detail', book: b });
                    }} 
                />
            </div>
        )}

        {view.type === 'book-detail' && (
          <BookDetail 
            book={view.book} 
            onBack={() => setView({ type: 'book-list' })}
            onAddToCart={addToCart}
            isFavorite={!!favorites.find((f) => f.bookId === view.book.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {view.type === 'auth' && (
            <Auth 
                mode={view.mode} 
                onLoginSuccess={handleLoginSuccess}
                onSwitchMode={(mode) => setView({ type: 'auth', mode })}
            />
        )}

        {view.type === 'user-center' && user && (
            <UserCenter
              user={user}
              onLogout={handleLogout}
              onUserUpdate={(next) => {
                setUser(next);
                localStorage.setItem(USER_KEY, JSON.stringify(next));
              }}
            />
        )}

        {view.type === 'admin-panel' && user?.role === 'admin' && (
            <AdminPanel 
              onExit={() => setView({ type: 'home' })}
              onBookCreated={loadBooks}
              books={books}
              onReloadBooks={loadBooks}
            />
        )}

        {view.type === 'checkout' && (
            <Checkout 
                items={cartItems}
                userId={user?.id}
                user={user}
                onBalanceChange={(next) => {
                  if (user) {
                    const updated = { ...user, balance: next };
                    setUser(updated);
                    localStorage.setItem(USER_KEY, JSON.stringify(updated));
                  }
                }}
                onBack={() => setView({ type: 'home' })}
                onSuccess={() => {
                    setCartItems([]);
                    setView({ type: 'success' });
                }}
            />
        )}

        {view.type === 'success' && (
            <div className="h-screen flex flex-col items-center justify-center bg-[#F5F2EB] text-center px-4">
                <div className="w-20 h-20 rounded-full bg-[#2C2A26] flex items-center justify-center mb-8">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#F5F2EB" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                     </svg>
                </div>
                <h2 className="text-3xl font-serif text-[#2C2A26] mb-4">订单提交成功</h2>
                <p className="text-[#5D5A53] mb-8">感谢您的惠顾，书籍将很快寄往您的手中。</p>
                <div className="flex gap-4">
                    <button onClick={() => setView({ type: 'user-center' })} className="px-6 py-3 border border-[#2C2A26] text-[#2C2A26] hover:bg-[#EBE7DE]">查看订单</button>
                    <button onClick={() => setView({ type: 'home' })} className="px-6 py-3 bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38]">返回首页</button>
                </div>
            </div>
        )}
      </main>

      {view.type !== 'checkout' && view.type !== 'admin-panel' && <Footer onLinkClick={(target) => handleNavClick(target)} />}
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
            setIsCartOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setView({ type: 'checkout' });
        }}
      />
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        items={favorites}
        onRemove={handleRemoveFavorite}
        onOpenBook={handleViewFavoriteBook}
      />
    </div>
  );
}

export default App;
