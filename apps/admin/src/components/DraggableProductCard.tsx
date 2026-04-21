'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Product } from '@/lib/api';

interface Props {
  product: Product;
  isAdded: boolean;
}

export function DraggableProductCard({ product, isAdded }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: product.id,
    disabled: isAdded,
  });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-xl p-3 border transition cursor-grab active:cursor-grabbing select-none ${
        isAdded
          ? 'bg-gray-800/40 border-gray-700 opacity-40 cursor-not-allowed'
          : isDragging
          ? 'opacity-0'
          : 'bg-gray-800 border-gray-700 hover:border-orange-500/50'
      }`}
    >
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="w-full h-16 object-cover rounded-lg mb-2" />
      )}
      <div className="text-white text-xs font-semibold truncate">{product.name}</div>
      <div className="text-orange-400 text-xs font-bold">${Number(product.price).toFixed(2)}</div>
      {isAdded && <div className="text-gray-500 text-xs mt-1">On canvas</div>}
    </div>
  );
}
