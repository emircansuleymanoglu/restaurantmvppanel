'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, Product } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; price: string; imageUrl: string }>({ name: '', price: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', imageUrl: '' });
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditValues({ name: p.name, price: String(p.price), imageUrl: p.imageUrl || '' });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const updated = await api.updateProduct(id, {
        name: editValues.name,
        price: parseFloat(editValues.price),
        imageUrl: editValues.imageUrl,
      });
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setFeedback({ id, ok: true });
      setTimeout(() => setFeedback(null), 2000);
      setEditingId(null);
    } catch {
      setFeedback({ id, ok: false });
      setTimeout(() => setFeedback(null), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this product from the menu?')) return;
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleAdd() {
    if (!newProduct.name || !newProduct.price) return;
    setSaving(true);
    try {
      const created = await api.createProduct({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        imageUrl: newProduct.imageUrl,
        restaurantId: '',
        isActive: true,
      });
      setProducts((prev) => [...prev, created]);
      setNewProduct({ name: '', price: '', imageUrl: '' });
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-gray-400">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">{products.length} items on the menu</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition flex items-center gap-2"
        >
          + Add Product
        </button>
      </div>

      {showAdd && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Product name"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="Price (e.g. 12.99)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
            <input
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
              placeholder="Image URL (optional)"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Create Product'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
              )}
            </div>

            {editingId === product.id ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="bg-gray-800 border border-orange-500 rounded-lg px-3 py-2 text-white focus:outline-none text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  value={editValues.price}
                  onChange={(e) => setEditValues({ ...editValues, price: e.target.value })}
                  className="bg-gray-800 border border-orange-500 rounded-lg px-3 py-2 text-white focus:outline-none text-sm"
                />
                <input
                  value={editValues.imageUrl}
                  onChange={(e) => setEditValues({ ...editValues, imageUrl: e.target.value })}
                  placeholder="Image URL"
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none text-sm"
                />
              </div>
            ) : (
              <div className="flex-1">
                <div className="font-semibold text-white">{product.name}</div>
                <div className="text-orange-400 font-bold text-lg">${Number(product.price).toFixed(2)}</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {feedback?.id === product.id && (
                <span className={`text-xs font-medium ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {feedback.ok ? '✓ Saved & broadcasted!' : '✗ Failed'}
                </span>
              )}

              {editingId === product.id ? (
                <>
                  <button
                    onClick={() => saveEdit(product.id)}
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                  >
                    {saving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(product)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
