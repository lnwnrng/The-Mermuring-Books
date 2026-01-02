/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Book } from '../types';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onAddToCart: (book: Book) => void;
  isFavorite: boolean;
  onToggleFavorite: (book: Book) => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onAddToCart, isFavorite, onToggleFavorite }) => {
  return (
    <div className="pt-32 min-h-screen bg-[#F5F2EB] animate-fade-in-up">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-24">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-medium text-[#A8A29E] hover:text-[#2C2A26] transition-colors mb-12"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          返回书库
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: Cover */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="w-full aspect-[2/3] bg-[#EBE7DE] shadow-2xl relative">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col pt-4">
            <div className="border-b border-[#D6D1C7] pb-8 mb-8">
              <span className="text-sm font-medium text-[#A8A29E] tracking-widest mb-2 block">{book.publisher}</span>
              <h1 className="text-4xl md:text-5xl font-serif text-[#2C2A26] mb-4">{book.title}</h1>
              <p className="text-lg text-[#5D5A53] mb-6">作者 {book.author}</p>
              <span className="text-3xl font-serif text-[#2C2A26]">¥ {book.price.toFixed(2)}</span>
            </div>

            <div className="prose prose-stone mb-10 text-[#5D5A53] font-light leading-loose">
              <h4 className="font-serif text-[#2C2A26] text-lg mb-2">内容简介</h4>
              <p>{book.description}</p>
            </div>

            <div className="bg-[#EBE7DE]/30 p-6 mb-8 grid grid-cols-2 gap-4 text-sm text-[#5D5A53]">
              <div><span className="text-[#A8A29E] mr-2">ISBN:</span> {book.isbn}</div>
              <div><span className="text-[#A8A29E] mr-2">出版时间:</span> {book.publishDate}</div>
              <div><span className="text-[#A8A29E] mr-2">分类:</span> {book.category}</div>
              <div><span className="text-[#A8A29E] mr-2">库存状态:</span> {book.stock > 0 ? '现货' : '缺货'}</div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => onAddToCart(book)}
                className="flex-1 py-4 bg-[#2C2A26] text-[#F5F2EB] tracking-widest text-sm font-medium hover:bg-[#433E38] transition-colors shadow-lg"
              >
                加入购物车
              </button>
              <button
                aria-label="收藏"
                onClick={() => onToggleFavorite(book)}
                className={`px-6 py-4 border border-[#2C2A26] text-[#2C2A26] hover:bg-[#EBE7DE] transition-colors flex items-center justify-center ${
                  isFavorite ? 'bg-[#EBE7DE]' : ''
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-6 h-6 ${isFavorite ? 'text-[#B91C1C] fill-[#B91C1C]' : ''}`} strokeWidth={1.5} stroke="currentColor" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
