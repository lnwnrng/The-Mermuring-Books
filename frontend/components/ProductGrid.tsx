/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

const categories = ['All', 'Audio', 'Wearable', 'Mobile', 'Home'];

interface ProductGridProps {
  onProductClick: (product: Product) => void;
  products?: Product[];
  isLoading?: boolean;
  error?: string | null;
  onReload?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onProductClick, products = [], isLoading = false, error, onReload }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  return (
    <section id="products" className="py-32 px-6 md:px-12 bg-[#F5F2EB]">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-24 space-y-8">
          <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26]">The Collection</h2>
          
          {/* Minimal Filter */}
          <div className="flex flex-wrap justify-center gap-8 pt-4 border-t border-[#D6D1C7]/50 w-full max-w-2xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm uppercase tracking-widest pb-1 border-b transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'border-[#2C2A26] text-[#2C2A26]' 
                    : 'border-transparent text-[#A8A29E] hover:text-[#2C2A26]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Large Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-4 animate-pulse">
                <div className="w-full aspect-[4/5] bg-[#EBE7DE]"></div>
                <div className="h-4 bg-[#EBE7DE] w-1/2"></div>
                <div className="h-3 bg-[#EBE7DE] w-1/3"></div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center text-[#5D5A53]">
              {error ? error : '暂无商品数据，等待后端接入。'}
              {onReload && (
                <div className="mt-4">
                  <button onClick={onReload} className="px-4 py-2 border border-[#2C2A26] text-sm hover:bg-[#EBE7DE]">重新加载</button>
                </div>
              )}
            </div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onClick={onProductClick} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
