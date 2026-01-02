/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { createOrder } from '../services/api';
import { Book, User } from '../types';

interface CheckoutProps {
  items: Book[];
  onBack: () => void;
  onSuccess: () => void;
  userId?: string;
  user?: User | null;
  onBalanceChange?: (next: number) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, onBack, onSuccess, userId, user, onBalanceChange }) => {
  const [contact, setContact] = useState({ name: '', phone: '', region: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const shipping = 0; // 应由后端返回的运费
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('购物车为空，无法提交订单');
      return;
    }
    if (paymentMethod !== 'balance') {
      setError('该支付渠道暂未开通，请使用账户余额支付');
      return;
    }
    if (!user || !userId) {
      setError('余额支付需先登录账户');
      return;
    }
    if (Number(user.balance) < total) {
      setError('余额不足，请先充值或调整购物车');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await createOrder({
        items,
        contact,
        paymentMethod,
        subtotal,
        shippingFee: shipping,
        total,
        userId,
      });
      if (onBalanceChange) {
        if (res.balance !== undefined) {
          onBalanceChange(res.balance);
        } else {
          const next = Number(user.balance) - total;
          onBalanceChange(Number(next.toFixed(2)));
        }
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交订单失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 bg-[#F5F2EB] animate-fade-in-up">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#A8A29E] hover:text-[#2C2A26] transition-colors mb-12"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          返回书库
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Form */}
          <div>
            <h1 className="text-3xl font-serif text-[#2C2A26] mb-8">订单确认</h1>

            {error && (
              <div className="mb-6 px-4 py-3 border border-[#B91C1C] text-[#B91C1C] bg-red-50 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-12">
              {/* Section 1: Contact */}
              <div>
                <h2 className="text-lg font-serif text-[#2C2A26] mb-6 border-b border-[#D6D1C7] pb-2">收件信息</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required 
                        type="text" 
                        placeholder="收件人姓名" 
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                      />
                      <input 
                        required 
                        type="tel" 
                        placeholder="联系电话" 
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                      />
                   </div>
                   <input 
                    required 
                    type="text" 
                    placeholder="省 / 市 / 区" 
                    value={contact.region}
                    onChange={(e) => setContact({ ...contact, region: e.target.value })}
                    className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                   />
                   <input 
                    required 
                    type="text" 
                    placeholder="详细地址（街道、门牌号）" 
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    className="w-full bg-transparent border-b border-[#D6D1C7] py-3 text-[#2C2A26] placeholder-[#A8A29E] outline-none focus:border-[#2C2A26] transition-colors" 
                   />
                </div>
              </div>

               {/* Section 3: Payment (placeholder) */}
              <div>
                <h2 className="text-lg font-serif text-[#2C2A26] mb-6 border-b border-[#D6D1C7] pb-2">支付方式</h2>
                <div className="grid grid-cols-3 gap-4">
                    <label className="border border-[#D6D1C7] p-4 text-center cursor-pointer hover:border-[#2C2A26] has-[:checked]:border-[#2C2A26] has-[:checked]:bg-[#EBE7DE]">
                        <input 
                          type="radio" 
                          name="payment" 
                          className="hidden" 
                          value="balance"
                          checked={paymentMethod === 'balance'}
                          onChange={() => setPaymentMethod('balance')}
                        />
                        <span className="text-sm font-medium">账户余额</span>
                    </label>
                    <label className="border border-[#D6D1C7] p-4 text-center cursor-pointer hover:border-[#2C2A26] has-[:checked]:border-[#2C2A26] has-[:checked]:bg-[#EBE7DE]">
                        <input 
                          type="radio" 
                          name="payment" 
                          className="hidden" 
                          value="wechat"
                          checked={paymentMethod === 'wechat'}
                          onChange={() => setPaymentMethod('wechat')}
                        />
                        <span className="text-sm font-medium">微信支付</span>
                    </label>
                    <label className="border border-[#D6D1C7] p-4 text-center cursor-pointer hover:border-[#2C2A26] has-[:checked]:border-[#2C2A26] has-[:checked]:bg-[#EBE7DE]">
                        <input 
                          type="radio" 
                          name="payment" 
                          className="hidden" 
                          value="alipay"
                          checked={paymentMethod === 'alipay'}
                          onChange={() => setPaymentMethod('alipay')}
                        />
                        <span className="text-sm font-medium">支付宝</span>
                    </label>
                </div>
              </div>

              <div>
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-[#2C2A26] text-[#F5F2EB] uppercase tracking-widest text-sm font-medium hover:bg-[#433E38] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? '处理中…' : `提交订单  ·  ¥ ${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:pl-12 lg:border-l border-[#D6D1C7] bg-[#EBE7DE]/20 p-8 rounded-sm">
            <h2 className="text-xl font-serif text-[#2C2A26] mb-8">订单详情</h2>
            
            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
               {items.map((item, idx) => (
                 <div key={idx} className="flex gap-4">
                    <div className="w-16 h-20 bg-[#EBE7DE] relative shrink-0">
                       <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <h3 className="font-serif text-[#2C2A26] text-base">{item.title}</h3>
                       <p className="text-xs text-[#A8A29E]">{item.author}</p>
                    </div>
                    <span className="text-sm text-[#5D5A53]">¥{item.price.toFixed(2)}</span>
                 </div>
               ))}
            </div>

            <div className="border-t border-[#D6D1C7] pt-6 space-y-2">
              <div className="flex justify-between text-sm text-[#5D5A53]">
                 <span>商品总额</span>
                 <span>¥ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#5D5A53]">
                 <span>运费</span>
                 <span>{shipping ? `¥ ${shipping.toFixed(2)}` : '待后端计算'}</span>
              </div>
            </div>
            
            <div className="border-t border-[#D6D1C7] mt-6 pt-6">
               <div className="flex justify-between items-center">
                 <span className="font-serif text-xl text-[#2C2A26]">总计</span>
                 <div className="flex items-end gap-2">
                   <span className="font-serif text-2xl text-[#2C2A26]">¥ {total.toFixed(2)}</span>
                 </div>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
