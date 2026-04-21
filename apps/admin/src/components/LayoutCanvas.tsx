'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { LayoutItem, Product } from '@/lib/api';

interface CanvasItem extends LayoutItem {
  product?: Product;
}

interface Props {
  items: CanvasItem[];
  onRemove: (id: string) => void;
}

const MIN_CARD_WIDTH = 170;
const MIN_CARD_HEIGHT = 180;

export function LayoutCanvas({ items, onRemove }: Props) {
  return (
    <div
      className="relative"
      style={{ minWidth: 900, minHeight: 600, backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <div className="text-5xl mb-3">📺</div>
            <div className="text-lg font-medium">Drop products here</div>
            <div className="text-sm mt-1">Drag items from the sidebar to build your TV layout</div>
          </div>
        </div>
      )}
      {items.map((item) => (
        <CanvasCard key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}

function CanvasCard({ item, onRemove }: { item: CanvasItem; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const width = Math.max(item.w || 0, MIN_CARD_WIDTH);
  const height = Math.max(item.h || 0, MIN_CARD_HEIGHT);
  const imageHeight = Math.max(108, height - 70);
  const compact = height <= 180;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: item.x + (transform?.x ?? 0),
    top: item.y + (transform?.y ?? 0),
    width,
    height,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div style={style} className="group">
      <button
        onClick={() => onRemove(item.id)}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        ×
      </button>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="h-full bg-gray-800 border-2 border-gray-700 hover:border-orange-500/50 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-lg flex flex-col"
      >
        {item.product?.imageUrl && (
          <img
            src={item.product.imageUrl}
            alt={item.product?.name}
            className="w-full object-cover object-center shrink-0"
            style={{ height: imageHeight }}
          />
        )}
        <div className={`min-h-0 flex-1 flex flex-col justify-start ${compact ? 'px-3.5 py-2.5' : 'p-3'}`}>
          <div className={`text-white font-semibold leading-tight truncate ${compact ? 'text-base' : 'text-sm'}`}>
            {item.product?.name ?? 'Product'}
          </div>
          <div className={`text-orange-400 font-bold leading-tight ${compact ? 'mt-0.5 text-xl' : 'mt-1 text-lg'}`}>
            ${Number(item.product?.price ?? 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
