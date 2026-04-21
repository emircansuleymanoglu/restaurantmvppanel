'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSocket } from '@/lib/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface LayoutItem {
  id: string;
  productId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function TVDisplay() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [flash, setFlash] = useState(false);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  async function fetchData() {
    if (!restaurantId) return;
    try {
      const [productsRes, layoutRes] = await Promise.all([
        fetch(`${API_URL}/public/${restaurantId}/products`),
        fetch(`${API_URL}/public/${restaurantId}/layout`),
      ]);
      const [prods, layout] = await Promise.all([productsRes.json(), layoutRes.json()]);
      setProducts(Array.isArray(prods) ? prods : []);
      setLayoutItems(layout?.layoutJson?.items || []);
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  }

  useEffect(() => {
    if (!restaurantId) return;
    fetchData();

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    if (socket.connected) setConnected(true);

    socket.emit('subscribe', { restaurantId });

    const event = `restaurant_${restaurantId}_update`;
    socket.on(event, () => {
      fetchData();
      setLastUpdate(new Date());
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    });

    return () => {
      socket.off(event);
    };
  }, [restaurantId]);

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-5xl mb-4">📺</div>
          <div className="text-2xl text-white font-bold">No Restaurant ID</div>
          <div className="text-gray-400 mt-2 font-mono text-sm">
            Add <span className="text-orange-400">?restaurantId=YOUR_ID</span> to the URL
          </div>
        </div>
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const hasLayout = layoutItems.length > 0;

  return (
    <div className={`min-h-screen bg-gray-950 transition-all ${flash ? 'brightness-110' : ''}`}>
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍔</span>
          <div>
            <div className="text-white font-bold text-xl">Our Menu</div>
            <div className="text-gray-400 text-xs">Today&apos;s selections</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-gray-500 text-xs">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${connected ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'LIVE' : 'Reconnecting...'}
          </div>
        </div>
      </header>

      <div className="p-8">
        {hasLayout ? (
          <div className="relative" style={{ minHeight: 700 }}>
            {layoutItems.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              return (
                <div
                  key={item.id}
                  className="absolute card-appear"
                  style={{ left: item.x, top: item.y, width: item.w }}
                >
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length === 0 && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-gray-600">
              <div className="text-5xl mb-3">🍽️</div>
              <div className="text-lg">Menu loading...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl live-indicator">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-5xl">🍔</div>
      )}
      <div className="p-4">
        <div className="text-white font-bold text-lg leading-tight">{product.name}</div>
        <div className="text-orange-400 font-extrabold text-2xl mt-1">${Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>}>
      <TVDisplay />
    </Suspense>
  );
}
