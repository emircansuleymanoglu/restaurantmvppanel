'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { api, Product, LayoutItem } from '@/lib/api';
import { DraggableProductCard } from '@/components/DraggableProductCard';
import { LayoutCanvas } from '@/components/LayoutCanvas';

export default function LayoutBuilderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    Promise.all([api.getProducts(), api.getLayout()]).then(([prods, layout]) => {
      setProducts(prods);
      setLayoutItems((layout.layoutJson as any)?.items || []);
      setLoading(false);
    });
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    setActiveId(null);

    const id = String(active.id);
    const isOnCanvas = layoutItems.some((item) => item.id === id);

    if (isOnCanvas) {
      setLayoutItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, x: Math.max(0, item.x + delta.x), y: Math.max(0, item.y + delta.y) }
            : item,
        ),
      );
    } else {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const alreadyAdded = layoutItems.some((item) => item.productId === id);
      if (alreadyAdded) return;
      setLayoutItems((prev) => [
        ...prev,
        { id: product.id, productId: product.id, x: 20 + prev.length * 10, y: 20 + prev.length * 10, w: 200, h: 180 },
      ]);
    }
  }

  function removeFromCanvas(id: string) {
    setLayoutItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.saveLayout({ items: layoutItems });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function clearCanvas() {
    setLayoutItems([]);
  }

  const activeProduct = activeId ? products.find((p) => p.id === activeId) : null;
  const canvasItems = layoutItems.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400">Loading layout builder...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Layout Builder</h1>
          <p className="text-gray-400 text-sm mt-0.5">Drag products onto the canvas to arrange your TV screen</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-green-400 text-sm font-medium animate-pulse">✓ Saved & broadcasted to TV!</span>
          )}
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-xl transition"
          >
            {saving ? 'Saving...' : '💾 Save Layout'}
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Products</div>
            <div className="space-y-2">
              {products.map((product) => {
                const isAdded = layoutItems.some((item) => item.productId === product.id);
                return (
                  <DraggableProductCard key={product.id} product={product} isAdded={isAdded} />
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-950 relative">
            <LayoutCanvas items={canvasItems} onRemove={removeFromCanvas} />
          </div>
        </div>

        <DragOverlay>
          {activeProduct && (
            <div className="w-48 bg-gray-800 border-2 border-orange-500 rounded-xl p-3 shadow-2xl opacity-90">
              {activeProduct.imageUrl && (
                <img src={activeProduct.imageUrl} alt={activeProduct.name} className="w-full h-24 object-cover rounded-lg mb-2" />
              )}
              <div className="text-white font-semibold text-sm truncate">{activeProduct.name}</div>
              <div className="text-orange-400 font-bold">${Number(activeProduct.price).toFixed(2)}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
