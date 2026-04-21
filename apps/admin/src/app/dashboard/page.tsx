'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import { getRestaurantId } from '@/lib/api';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = getRestaurantId();

  useEffect(() => {
    api.getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const tvUrl = `${process.env.NEXT_PUBLIC_TV_URL || 'http://localhost:3002'}?restaurantId=${restaurantId}`;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
      <p className="text-gray-400 mb-8">Welcome to your restaurant signage dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Products" value={products.length} icon="🍔" color="orange" />
        <StatCard title="Active Items" value={products.filter(p => p.isActive).length} icon="✅" color="green" />
        <StatCard title="TV Screens" value="Live" icon="📺" color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/products" className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition">
              <span className="text-xl">🍔</span>
              <div>
                <div className="font-medium text-white text-sm">Manage Products</div>
                <div className="text-xs text-gray-400">Add, edit, or update prices</div>
              </div>
            </Link>
            <Link href="/dashboard/layout" className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition">
              <span className="text-xl">🎨</span>
              <div>
                <div className="font-medium text-white text-sm">Layout Builder</div>
                <div className="text-xs text-gray-400">Drag and drop screen layout</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">TV Screen</h2>
          <p className="text-sm text-gray-400 mb-4">Share this URL with your TV screens:</p>
          <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-orange-400 break-all mb-4">
            {tvUrl}
          </div>
          <a
            href={tvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition"
          >
            📺 Open TV View
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  const colorMap = {
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-3xl font-bold ${colorMap[color as keyof typeof colorMap]?.split(' ')[2]}`}>{value}</span>
      </div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}
