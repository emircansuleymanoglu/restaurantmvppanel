'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const POLL_INTERVAL = 5000;
const MIN_CARD_WIDTH = 170;
const MIN_CARD_HEIGHT = 180;

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
  const prevProductsRef = useRef<string>('');

  async function fetchData(silent = false) {
    if (!restaurantId) return;

    try {
      const [productsRes, layoutRes] = await Promise.all([
        fetch(`${API_URL}/public/${restaurantId}/products`),
        fetch(`${API_URL}/public/${restaurantId}/layout`),
      ]);
      const [prods, layout] = await Promise.all([productsRes.json(), layoutRes.json()]);
      const newProds: Product[] = Array.isArray(prods) ? prods : [];
      const newLayout: LayoutItem[] = Array.isArray(layout?.layoutJson?.items)
        ? layout.layoutJson.items
        : [];

      const serialized = JSON.stringify(newProds);
      if (!silent && serialized !== prevProductsRef.current && prevProductsRef.current !== '') {
        setLastUpdate(new Date());
        setFlash(true);
        setTimeout(() => setFlash(false), 800);
      }

      prevProductsRef.current = serialized;
      setProducts(newProds);
      setLayoutItems(newLayout);
      setConnected(true);
    } catch (e) {
      console.error('Failed to fetch data', e);
      setConnected(false);
    }
  }

  useEffect(() => {
    if (!restaurantId) return;

    fetchData(true);
    const interval = setInterval(() => fetchData(), POLL_INTERVAL);
    return () => clearInterval(interval);
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
  const visibleLayoutItems = layoutItems.filter((item) => productMap.has(item.productId));
  const hasLayout = visibleLayoutItems.length > 0;
  const canvasHeight = Math.max(
    700,
    ...visibleLayoutItems.map((item) => item.y + Math.max(item.h || 0, MIN_CARD_HEIGHT) + 32),
  );

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
          <div
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
              connected
                ? 'text-green-400 border-green-500/30 bg-green-500/10'
                : 'text-red-400 border-red-500/30 bg-red-500/10'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            {connected ? 'LIVE' : 'Reconnecting...'}
          </div>
        </div>
      </header>

      <div className="p-8">
        {hasLayout ? (
          <div className="relative w-full overflow-hidden" style={{ minHeight: canvasHeight }}>
            {visibleLayoutItems.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;

              const width = Math.max(item.w || 0, MIN_CARD_WIDTH);
              const height = Math.max(item.h || 0, MIN_CARD_HEIGHT);

              return (
                <div
                  key={item.id}
                  className="absolute card-appear"
                  style={{ left: item.x, top: item.y, width, height }}
                >
                  <ProductCard product={product} height={height} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
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

function ProductCard({ product, height }: { product: Product; height?: number }) {
  const imageHeight = height ? Math.max(108, height - 70) : 160;
  const compact = Boolean(height && height <= 180);

  return (
    <div
      style={{
        height: height ?? 'auto',
        background: '#111827',
        border: '1px solid #374151',
        borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: imageHeight,
            objectFit: 'cover',
            objectPosition: 'center',
            flexShrink: 0,
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: imageHeight,
            background: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            flexShrink: 0,
          }}
        >
          Food
        </div>
      )}
      <div
        style={{
          padding: compact ? '0.625rem 0.875rem' : '0.75rem 1rem',
          minHeight: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontWeight: 700,
            fontSize: compact ? '1rem' : '1.125rem',
            lineHeight: 1.15,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            color: '#fb923c',
            fontWeight: 800,
            fontSize: compact ? '1.25rem' : '1.5rem',
            lineHeight: 1.1,
            marginTop: compact ? '2px' : '4px',
          }}
        >
          ${Number(product.price).toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <TVDisplay />
    </Suspense>
  );
}
