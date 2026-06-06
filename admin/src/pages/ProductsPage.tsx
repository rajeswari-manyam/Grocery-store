import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Upload } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../utils/formatPrice';
import { compressImage } from '../utils/compressImage';
import ProductImage from '../components/ui/ProductImage';

const categories = [
  { id: 'millets', name: 'Millets & Healthy Grains', icon: '🌾' },
  { id: 'rice', name: 'Rice Varieties', icon: '🍚' },
  { id: 'flours', name: 'Flours & Powders', icon: '🌾' },
  { id: 'pulses', name: 'Pulses & Lentils', icon: '🫘' },
  { id: 'seeds', name: 'Seeds & Health Add-Ons', icon: '🌰' },
  { id: 'ready', name: 'Ready Products', icon: '🍜' },
    { id: 'grocery-staples', name: 'Grocery & Staples', icon: '🛒' },
  { id: 'spices-oils', name: 'Spices & Oils', icon: '🧂' },
  { id: 'grains-processed', name: 'Grains & Processed Foods', icon: '🌾' },

];

interface FormProduct {
  name: string; category: string; price: number; originalPrice: string;
  images: string[]; unit: string; description: string; inStock: boolean; isFlashSale: boolean; discount: string;
}

const emptyForm: FormProduct = {
  name: '', category: 'millets', price: 0, originalPrice: '',
  images: [], unit: '', description: '', inStock: true, isFlashSale: false, discount: '',
};

function ImageUpload({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (value.length >= 5) return;
    let url: string;
    try {
      const compressed = await compressImage(file);
      url = compressed;
    } catch {
      url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    onChange([...value, url]);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="col-span-2">
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Product Images (up to 5)</label>
      <div className="grid grid-cols-5 gap-2">
        {value.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
            <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-contain" />
            <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-slate-500 hover:text-red-500 shadow-sm border-none cursor-pointer">
              <X size={12} />
            </button>
          </div>
        ))}
        {value.length < 5 && (
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <Upload size={16} className="text-slate-300" />
            <span className="text-[10px] text-slate-400 mt-1">{value.length + 1}/5</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
    </div>
  );
}

export default function AdminProductsPage() {
  const { products, addProduct, editProduct, removeProduct } = useProducts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormProduct>(emptyForm);
  const [filterCat, setFilterCat] = useState('all');

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (p: typeof products[0]) => {
    setForm({
      name: p.name, category: p.category, price: p.price,
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      images: p.images || (p.image ? [p.image] : []), unit: p.unit, description: p.description,
      inStock: p.inStock, isFlashSale: p.isFlashSale,
      discount: p.discount ? String(p.discount) : '',
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await removeProduct(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = form.images.length > 0 ? form.images : ['https://images.unsplash.com/photo-1605294533410-0ec6f3c145e3?w=200&q=80'];
    const payload = {
      name: form.name, category: form.category, price: form.price,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      image: images[0], images, unit: form.unit, description: form.description,
      inStock: form.inStock, isFlashSale: form.isFlashSale,
      discount: form.discount ? Number(form.discount) : null,
    };
    try {
      if (editingId) {
        await editProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const update = (field: keyof FormProduct, value: string | boolean | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">{products.length} products</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm border-none cursor-pointer">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilterCat('all')} className={`text-xs font-semibold px-4 py-2 rounded-full border-2 transition-all cursor-pointer flex-shrink-0 ${filterCat === 'all' ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={`text-xs font-semibold px-4 py-2 rounded-full border-2 transition-all cursor-pointer flex-shrink-0 ${filterCat === c.id ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}>{c.icon} {c.name.split(' ')[0]}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Product</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Category</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Price</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600">Stock</th>
                <th className="text-right px-5 py-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <ProductImage image={p.images?.[0] || p.image} name={p.name} className="w-full h-full object-cover" textSize="text-2xl" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {categories.find(c => c.id === p.category)?.name || p.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800">{formatPrice(p.price)}</span>
                    {p.originalPrice && <span className="text-xs text-slate-400 line-through ml-1.5">{formatPrice(p.originalPrice)}</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all bg-transparent border-none cursor-pointer"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all bg-transparent border-none cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-16 text-center">
                  <div className="text-4xl mb-3">{filterCat === 'all' ? '📦' : '🔍'}</div>
                  <p className="text-base font-semibold text-slate-500">No products found</p>
                  <p className="text-sm text-slate-400 mt-1">{filterCat === 'all' ? 'Add your first product to get started.' : `No products in this category.`}</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all bg-transparent border-none cursor-pointer"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Product Name</label>
                    <input required value={form.name} onChange={e => update('name', e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white" placeholder="e.g. Premium Ragi" />
                  </div>

                  <ImageUpload value={form.images} onChange={urls => setForm(prev => ({ ...prev, images: urls }))} />

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
                    <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Price (₹)</label>
                    <input required type="text" value={form.price} onChange={e => update('price', Number(e.target.value) || 0)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Original Price (optional)</label>
                    <input type="number" min={0} value={form.originalPrice} onChange={e => update('originalPrice', e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Unit</label>
                    <input required value={form.unit} onChange={e => update('unit', e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white" placeholder="1 kg, 500 g" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description</label>
                    <textarea required value={form.description} onChange={e => update('description', e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white resize-none" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.inStock} onChange={e => update('inStock', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    <span className="text-sm text-slate-600">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFlashSale} onChange={e => update('isFlashSale', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                    <span className="text-sm text-slate-600">Flash Sale</span>
                  </label>
                  {form.isFlashSale && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Discount %</label>
                      <input type="number" min={0} max={100} value={form.discount} onChange={e => update('discount', e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all bg-transparent cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-all shadow-sm border-none cursor-pointer">{editingId ? 'Update' : 'Add'} Product</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
