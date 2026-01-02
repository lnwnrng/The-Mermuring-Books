/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { User, Order } from '../types';
import { fetchMyOrders, createBookRequest, updateMe, fetchMe, topUpBalance } from '../services/api';

interface UserCenterProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (user: User) => void;
}

const UserCenter: React.FC<UserCenterProps> = ({ user, onLogout, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqAuthor, setReqAuthor] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [reqMsg, setReqMsg] = useState<string | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);
  const [reqSubmitting, setReqSubmitting] = useState(false);

  const levelScoreMap: Record<string, number> = {
    '白银': 50,
    '黄金': 70,
    '钻石': 85,
    '翡翠': 92,
    '玛瑙': 97,
  };
  const parsedScore = () => {
    const num = Number(user.creditLevel);
    if (Number.isFinite(num)) return num;
    if (user.creditLevel && levelScoreMap[user.creditLevel]) return levelScoreMap[user.creditLevel];
    return 0;
  };
  const creditScore = Math.max(0, Math.min(100, parsedScore()));
  const getCreditMeta = (score: number) => {
    if (score >= 97) return { label: '玛瑙', bg: '#FEF2F2', ring: '#FCA5A5', text: '#B91C1C' };
    if (score >= 92) return { label: '翡翠', bg: '#ECFDF3', ring: '#86EFAC', text: '#15803D' };
    if (score >= 85) return { label: '钻石', bg: '#EEF2FF', ring: '#C7D2FE', text: '#4338CA' };
    if (score >= 70) return { label: '黄金', bg: '#FFFBEB', ring: '#FDE68A', text: '#B45309' };
    return { label: '白银', bg: '#F8FAFC', ring: '#E2E8F0', text: '#475569' };
  };
  const creditMeta = getCreditMeta(creditScore);

  const [profile, setProfile] = useState({
    name: user.name,
    phone: user.phone || '',
    avatar: user.avatar || '',
  });
  const [currentBalance, setCurrentBalance] = useState<number>(Number(user.balance ?? 0));
  const [balanceAmount, setBalanceAmount] = useState<string>('100');
  const [balanceMessage, setBalanceMessage] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      setOrdersLoading(true);
      setOrdersError(null);
      fetchMyOrders()
        .then((data) => setOrders(data))
        .catch((err) => setOrdersError(err instanceof Error ? err.message : '获取订单失败'))
        .finally(() => setOrdersLoading(false));
    }
    if (activeTab === 'info') {
      fetchMe()
        .then((me) => {
          setProfile({
            name: me.name,
            phone: me.phone || '',
            avatar: me.avatar || '',
          });
          setCurrentBalance(Number(me.balance ?? 0));
          if (onUserUpdate) onUserUpdate(me);
        })
        .catch(() => {
          /* ignore */
        });
    }
  }, [activeTab]);

  useEffect(() => {
    setProfile({
      name: user.name,
      phone: user.phone || '',
      avatar: user.avatar || '',
    });
    setCurrentBalance(Number(user.balance ?? 0));
  }, [user]);

  const menuItems = [
    { id: 'info', label: '个人信息' },
    { id: 'orders', label: '我的订单' },
    { id: 'balance', label: '账户余额' },
    { id: 'credit', label: '信用等级' },
    { id: 'request', label: '缺书登记' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 bg-[#F5F2EB]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-[#2C2A26] mb-12">个人中心</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
             <div className="bg-white border border-[#D6D1C7] p-6 shadow-sm mb-6 text-center">
                 <div className="w-20 h-20 bg-[#EBE7DE] rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                     {user.avatar ? (
                         <img src={user.avatar} className="w-full h-full object-cover" />
                     ) : (
                         <span className="text-2xl font-serif text-[#A8A29E]">{user.name.charAt(0)}</span>
                     )}
                 </div>
                 <h3 className="font-serif text-lg">{user.name}</h3>
                 <span className="text-xs text-[#A8A29E] border border-[#A8A29E] px-2 py-0.5 rounded-full mt-2 inline-block">
                     会员
                 </span>
             </div>

             <nav className="flex flex-col border border-[#D6D1C7] bg-white">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`text-left px-6 py-4 text-sm font-medium transition-colors border-l-4 ${
                            activeTab === item.id 
                                ? 'border-[#2C2A26] bg-[#F5F2EB] text-[#2C2A26]' 
                                : 'border-transparent text-[#5D5A53] hover:bg-[#F9F8F6]'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
                <button 
                    onClick={onLogout}
                    className="text-left px-6 py-4 text-sm font-medium text-red-800 border-l-4 border-transparent hover:bg-red-50 transition-colors border-t border-[#F5F2EB]"
                >
                    退出登录
                </button>
             </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-white border border-[#D6D1C7] p-8 shadow-sm min-h-[500px]">
            
            {activeTab === 'info' && (
                <div className="animate-fade-in-up">
                    <h2 className="text-xl font-serif mb-6 pb-4 border-b border-[#D6D1C7]">个人信息管理</h2>
              <div className="space-y-6 max-w-md">
                {profileMessage && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3">{profileMessage}</div>}
                {profileError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{profileError}</div>}
                <div>
                    <label className="block text-xs font-bold text-[#A8A29E] mb-2 uppercase">昵称</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full border-b border-[#D6D1C7] py-2 focus:border-[#2C2A26] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#A8A29E] mb-2 uppercase">绑定邮箱</label>
                    <input type="text" value={user.email || ''} disabled className="w-full border-b border-[#D6D1C7] py-2 text-gray-400 bg-transparent" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#A8A29E] mb-2 uppercase">联系电话</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full border-b border-[#D6D1C7] py-2 focus:border-[#2C2A26] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#A8A29E] mb-2 uppercase">头像 URL</label>
                    <input
                      type="text"
                      value={profile.avatar}
                      onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                      className="w-full border-b border-[#D6D1C7] py-2 focus:border-[#2C2A26] outline-none"
                    />
                </div>
                <button
                  disabled={profileSaving}
                  onClick={async () => {
                    setProfileError(null);
                    setProfileMessage(null);
                    setProfileSaving(true);
                    try {
                      const updated = await updateMe({
                        name: profile.name.trim(),
                        phone: profile.phone.trim() || null,
                        avatar: profile.avatar.trim() || null,
                      });
                      setProfileMessage('已保存');
                      setProfile({
                        name: updated.name,
                        phone: updated.phone || '',
                        avatar: updated.avatar || '',
                      });
                      if (onUserUpdate) onUserUpdate(updated);
                    } catch (err) {
                      setProfileError(err instanceof Error ? err.message : '保存失败');
                    } finally {
                    setProfileSaving(false);
                  }
                  }}
                  className="px-6 py-3 bg-[#2C2A26] text-[#F5F2EB] text-sm hover:bg-[#433E38] mt-4 disabled:opacity-50"
                >
                  {profileSaving ? '保存中...' : '保存修改'}
                </button>
              </div>
            </div>
          )}

            {activeTab === 'orders' && (
                <div className="animate-fade-in-up">
                    <h2 className="text-xl font-serif mb-6 pb-4 border-b border-[#D6D1C7]">我的订单</h2>
                    {ordersLoading && <p className="text-sm text-[#5D5A53] mb-4">加载中...</p>}
                    {ordersError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3">{ordersError}</div>}
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                                <p className="text-[#5D5A53]">暂无订单记录</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="border border-[#EBE7DE] p-4 space-y-3">
                                    <div className="flex justify-between text-sm text-[#5D5A53]">
                                      <span>订单号: {order.id}</span>
                                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm text-[#2C2A26]">状态: {order.status}</div>
                                    <div className="space-y-2">
                                      {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-[#5D5A53]">
                                          <span>{item.book.title} x {item.quantity}</span>
                                          <span>¥ {Number(item.price).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-between text-sm text-[#2C2A26] font-medium border-t border-[#F0ECE3] pt-2">
                                      <span>合计</span>
                                      <span>¥ {Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'balance' && (
                <div className="animate-fade-in-up">
                    <h2 className="text-xl font-serif mb-6 pb-4 border-b border-[#D6D1C7]">账户余额</h2>
                    <div className="bg-[#F9F8F6] p-8 text-center rounded-sm border border-[#E7E3DB]">
                        <span className="block text-sm text-[#5D5A53] mb-2">当前可用余额</span>
                        <span className="text-4xl font-serif text-[#2C2A26]">¥ {currentBalance.toFixed(2)}</span>
                    </div>
                    <div className="mt-8 max-w-lg">
                        <h3 className="text-sm font-bold mb-4">充值</h3>
                        {balanceMessage && <div className="text-sm text-green-800 bg-green-50 border border-green-200 p-3 mb-3 rounded-sm">{balanceMessage}</div>}
                        {balanceError && <div className="text-sm text-red-800 bg-red-50 border border-red-200 p-3 mb-3 rounded-sm">{balanceError}</div>}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {[50, 100, 200, 500].map((amt) => (
                                <button
                                  key={amt}
                                  onClick={() => setBalanceAmount(String(amt))}
                                  className={`border py-3 text-sm transition-colors ${
                                    balanceAmount === String(amt)
                                      ? 'border-[#2C2A26] bg-[#EBE7DE]'
                                      : 'border-[#D6D1C7] hover:border-[#2C2A26] hover:bg-[#F9F8F6]'
                                  }`}
                                >
                                    ¥ {amt}
                                </button>
                            ))}
                        </div>
                        <label className="block text-xs font-bold text-[#A8A29E] mb-2 uppercase">自定义金额</label>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1 border-b border-[#D6D1C7]">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={balanceAmount}
                              onChange={(e) => setBalanceAmount(e.target.value)}
                              className="w-full py-3 outline-none bg-transparent"
                              placeholder="请输入充值金额"
                            />
                          </div>
                          <button
                            disabled={balanceLoading}
                            onClick={async () => {
                              const value = Number(balanceAmount);
                              if (!Number.isFinite(value) || value <= 0) {
                                setBalanceError('请输入大于 0 的金额');
                                setBalanceMessage(null);
                                return;
                              }
                              setBalanceLoading(true);
                              setBalanceError(null);
                              setBalanceMessage(null);
                              try {
                                const updated = await topUpBalance(value);
                                const nextBalance = Number(updated.balance ?? 0);
                                setCurrentBalance(nextBalance);
                                setBalanceMessage(`充值成功，当前余额 ¥ ${nextBalance.toFixed(2)}`);
                                if (onUserUpdate) onUserUpdate(updated);
                              } catch (err) {
                                setBalanceError(err instanceof Error ? err.message : '充值失败，请稍后再试');
                              } finally {
                                setBalanceLoading(false);
                              }
                            }}
                            className="px-6 py-3 bg-[#2C2A26] text-[#F5F2EB] text-sm hover:bg-[#433E38] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {balanceLoading ? '充值中...' : '立即充值'}
                          </button>
                        </div>
                        <p className="text-xs text-[#A8A29E] mt-3">余额仅用于站内消费，暂不支持提现。</p>
                    </div>
                </div>
            )}

              {activeTab === 'credit' && (
                 <div className="animate-fade-in-up">
                    <h2 className="text-xl font-serif mb-6 pb-4 border-b border-[#D6D1C7]">我的信用</h2>
                    <div className="flex flex-col items-start gap-4 mb-10">
                       <div
                         className="w-28 h-28 rounded-full border-4 flex items-center justify-center text-2xl font-serif self-center"
                         style={{ backgroundColor: creditMeta.bg, borderColor: creditMeta.ring, color: creditMeta.text }}
                       >
                          {creditMeta.label}
                       </div>
                       <div className="space-y-2 w-full">
                          <p className="text-base text-[#2C2A26] font-semibold">
                            当前信用积分：<span className="font-bold">{Number.isFinite(creditScore) ? creditScore : '--'}</span>
                          </p>
                          <p className="text-sm text-[#A8A29E]">具体积分规则请查看帮助中心</p>
                          <div className="mt-3 text-sm text-[#5D5A53] space-y-1 bg-[#F9F8F6] border border-[#E7E3DB] p-4 rounded-sm">
                            <p className="font-semibold text-[#2C2A26]">等级与积分对应：</p>
                            <p>白银：0 - 69 分</p>
                            <p>黄金：70 - 84 分</p>
                            <p>钻石：85 - 91 分</p>
                            <p>翡翠：92 - 96 分</p>
                            <p>玛瑙：97 - 100 分</p>
                          </div>
                       </div>
                    </div>
                 </div>
            )}

             {activeTab === 'request' && (
                 <div className="animate-fade-in-up">
                    <h2 className="text-xl font-serif mb-6 pb-4 border-b border-[#D6D1C7]">缺书登记</h2>
                    <p className="text-sm text-[#5D5A53] mb-4">没有找到您想要的书？请告诉我们，我们会尽快采购并通知您。</p>
                    {reqMsg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 mb-3">{reqMsg}</div>}
                    {reqError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 mb-3">{reqError}</div>}
                    <div className="space-y-4 max-w-md">
                        <input
                          type="text"
                          placeholder="书名 *"
                          value={reqTitle}
                          onChange={(e) => setReqTitle(e.target.value)}
                          className="w-full border-b border-[#D6D1C7] py-3 outline-none focus:border-[#2C2A26]"
                        />
                        <input
                          type="text"
                          placeholder="作者 (选填)"
                          value={reqAuthor}
                          onChange={(e) => setReqAuthor(e.target.value)}
                          className="w-full border-b border-[#D6D1C7] py-3 outline-none focus:border-[#2C2A26]"
                        />
                        <textarea
                          placeholder="备注说明"
                          value={reqNote}
                          onChange={(e) => setReqNote(e.target.value)}
                          className="w-full border border-[#D6D1C7] p-3 mt-2 h-24 outline-none focus:border-[#2C2A26] bg-transparent resize-none"
                        ></textarea>
                        <button
                          disabled={reqSubmitting || !reqTitle.trim()}
                          onClick={async () => {
                            setReqError(null);
                            setReqMsg(null);
                            setReqSubmitting(true);
                            try {
                              await createBookRequest({ title: reqTitle.trim(), author: reqAuthor.trim() || undefined, note: reqNote.trim() || undefined });
                              setReqMsg('登记成功，我们会尽快处理。');
                              setReqTitle('');
                              setReqAuthor('');
                              setReqNote('');
                            } catch (err) {
                              setReqError(err instanceof Error ? err.message : '提交失败，请稍后重试');
                            } finally {
                              setReqSubmitting(false);
                            }
                          }}
                          className="px-8 py-3 bg-[#2C2A26] text-[#F5F2EB] hover:bg-[#433E38] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reqSubmitting ? '提交中...' : '提交登记'}
                        </button>
                    </div>
                 </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenter;
