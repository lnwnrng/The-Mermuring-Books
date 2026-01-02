/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { JournalArticle } from '../types';

interface JournalProps {
  onArticleClick: (article: JournalArticle) => void;
  articles?: JournalArticle[];
  isLoading?: boolean;
}

const Journal: React.FC<JournalProps> = ({ onArticleClick, articles = [], isLoading = false }) => {
  return (
    <section id="journal" className="bg-[#F5F2EB] py-32 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 pb-8 border-b border-[#D6D1C7]">
            <div>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4">Editorial</span>
                <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26]">The Journal</h2>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-4 animate-pulse">
                  <div className="w-full aspect-[4/3] bg-[#EBE7DE]"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-[#EBE7DE] w-1/2"></div>
                    <div className="h-3 bg-[#EBE7DE] w-3/4"></div>
                    <div className="h-3 bg-[#EBE7DE] w-2/3"></div>
                  </div>
                </div>
              ))
            ) : articles.length === 0 ? (
              <div className="col-span-full text-center text-[#5D5A53]">
                暂无文章数据，等待后端接入。
              </div>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="group cursor-pointer flex flex-col text-left" onClick={() => onArticleClick(article)}>
                    <div className="w-full aspect-[4/3] overflow-hidden mb-8 bg-[#EBE7DE]">
                        <img 
                            src={article.image} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
                        />
                    </div>
                    <div className="flex flex-col flex-1 text-left">
                        <span className="text-xs font-medium uppercase tracking-widest text-[#A8A29E] mb-3">{article.date}</span>
                        <h3 className="text-2xl font-serif text-[#2C2A26] mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">{article.title}</h3>
                        <p className="text-[#5D5A53] font-light leading-relaxed">{article.excerpt}</p>
                    </div>
                </div>
            ))
            }
        </div>
      </div>
    </section>
  );
};

export default Journal;
