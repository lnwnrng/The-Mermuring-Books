/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { Book } from '../types';

interface BookListProps {
  onBookClick: (book: Book) => void;
  title?: string;
  limit?: number;
  books: Book[];
  isLoading?: boolean;
  error?: string | null;
  onReload?: () => void;
}

const BookList: React.FC<BookListProps> = ({ onBookClick, title = "藏书目录", limit, books, isLoading = false, error, onReload }) => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = limit || 8;

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      (b.category || '')
        .split('·')
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => set.add(c));
    });
    return ['全部', ...Array.from(set)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    let booksToShow = books;

    // Filter by Category
    if (activeCategory !== '全部') {
      booksToShow = booksToShow.filter(b => (b.category || '').toLowerCase().split('·').map(c => c.trim()).includes(activeCategory.toLowerCase()));
    }

    // Filter by Search Term
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase().trim();
      booksToShow = booksToShow.filter(b => 
        b.title.toLowerCase().includes(lowerTerm) ||
        b.author.toLowerCase().includes(lowerTerm) ||
        b.isbn.includes(lowerTerm)
      );
    }

    if (limit) {
        return booksToShow.slice(0, limit);
    }
    return booksToShow;
  }, [activeCategory, books, limit, searchTerm]);

  // total pages for full list view
  const totalPages = useMemo(() => {
    if (limit) return 1;
    return Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  }, [filteredBooks.length, limit, pageSize]);

  // reset to first page when filters change (only for non-limit view)
  React.useEffect(() => {
    if (!limit) setCurrentPage(1);
  }, [activeCategory, searchTerm, limit]);

  const pageBooks = useMemo(() => {
    if (limit) return filteredBooks;
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize, limit]);

  return (
    <section className="py-20 px-6 md:px-12 bg-[#F5F2EB]">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <h2 className="text-3xl md:text-5xl font-serif text-[#2C2A26]">{title}</h2>
          
          {!limit && (
            <>
              {/* Search Bar */}
              <div className="w-full max-w-md relative mb-4">
                <input
                  type="text"
                  placeholder="搜索书名、作者或 ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-[#D6D1C7] py-2 pl-4 pr-10 text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors text-center"
                />
                <div className="absolute right-2 top-2 text-[#A8A29E]">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                   </svg>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap justify-center gap-6 pt-4 border-t border-[#D6D1C7]/50 w-full max-w-2xl">
                {categoryOptions.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm tracking-widest pb-1 border-b transition-all duration-300 ${
                      activeCategory === cat 
                        ? 'border-[#2C2A26] text-[#2C2A26] font-medium' 
                        : 'border-transparent text-[#A8A29E] hover:text-[#2C2A26]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 min-h-[400px]">
          {isLoading ? (
            // Skeleton Loading UI
            Array.from({ length: limit || 8 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-4 animate-pulse">
                <div className="w-full aspect-[2/3] bg-[#EBE7DE] shadow-sm rounded-sm"></div>
                <div className="px-2 space-y-3">
                    {/* Title Placeholder */}
                    <div className="h-5 bg-[#EBE7DE] w-3/4 rounded-sm"></div>
                    {/* Author Placeholder */}
                    <div className="h-3 bg-[#EBE7DE] w-1/2 rounded-sm"></div>
                    {/* Price/Cat Placeholder */}
                    <div className="flex justify-between items-center border-t border-[#D6D1C7]/30 pt-3 mt-2">
                        <div className="h-4 bg-[#EBE7DE] w-16 rounded-sm"></div>
                        <div className="h-3 bg-[#EBE7DE] w-8 rounded-sm"></div>
                    </div>
                </div>
              </div>
            ))
          ) : filteredBooks.length > 0 ? (
            // Actual Data
            pageBooks.map(book => (
              <div key={book.id} className="group flex flex-col gap-4 cursor-pointer animate-fade-in-up" onClick={() => onBookClick(book)}>
                  <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#EBE7DE] shadow-sm group-hover:shadow-xl transition-all duration-500">
                      <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105"
                      />
                      {book.stock < 10 && book.stock > 0 && (
                          <div className="absolute top-2 right-2 bg-[#2C2A26] text-[#F5F2EB] text-xs px-2 py-1">
                              仅剩 {book.stock} 本
                          </div>
                      )}
                  </div>
                  
                  <div className="text-center md:text-left px-2">
                      <h3 className="text-lg font-serif font-medium text-[#2C2A26] mb-1 group-hover:underline underline-offset-4 decoration-1 transition-all">{book.title}</h3>
                      <p className="text-xs text-[#5D5A53] mb-2">{book.author}</p>
                      <div className="flex justify-between items-center border-t border-[#D6D1C7]/30 pt-2 mt-2">
                          <span className="text-sm font-bold text-[#2C2A26]">¥ {book.price.toFixed(2)}</span>
                          <span className="text-xs text-[#A8A29E]">{(book.category || '').split('·').map(c => c.trim()).filter(Boolean).join(' · ')}</span>
                      </div>
                  </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-60">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[#A8A29E] mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-[#5D5A53]">
                  {error ? error : '暂无图书数据，等待后端接口接入。'}
                </p>
                {onReload && (
                  <button 
                    onClick={onReload}
                    className="mt-6 px-4 py-2 border border-[#2C2A26] text-[#2C2A26] hover:bg-[#EBE7DE] transition-colors text-sm"
                  >
                    重新加载
                  </button>
                )}
            </div>
          )}
        </div>

        {!limit && totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-sm text-sm font-serif tracking-wide bg-[#F0ECE3] text-[#2C2A26] hover:bg-[#EBE7DE] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-sm text-sm font-serif tracking-wide transition-colors ${
                    isActive
                      ? 'bg-[#2C2A26] text-[#F5F2EB]'
                      : 'bg-[#F0ECE3] text-[#5D5A53] hover:bg-[#F5F2EB] hover:text-[#2C2A26]'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <span className="text-xs text-[#A8A29E] px-2">第 {currentPage} / {totalPages} 页</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-sm text-sm font-serif tracking-wide bg-[#F0ECE3] text-[#2C2A26] hover:bg-[#EBE7DE] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookList;
