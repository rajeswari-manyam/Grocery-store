export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  image: string;
  unit: string;
  description: string;
  inStock: boolean;
  isFlashSale: boolean;
  discount: number | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { id: 'millets', name: 'Millets & Healthy Grains', icon: '🌾', color: '#d97706' },
  { id: 'rice', name: 'Rice Varieties', icon: '🍚', color: '#f59e0b' },
  { id: 'flours', name: 'Flours & Powders', icon: '🌾', color: '#a855f7' },
  { id: 'pulses', name: 'Pulses & Lentils', icon: '🫘', color: '#8b5cf6' },
  { id: 'seeds', name: 'Seeds & Health Add-Ons', icon: '🌰', color: '#10b981' },
  { id: 'ready', name: 'Ready Products', icon: '🍜', color: '#f97316' },
];

export const products: Product[] = [
  {
    id: 'm1', name: 'Ragi (Finger Millet)', category: 'millets', price: 85, originalPrice: 100,
    image: '🌾', unit: '1 kg', description: 'Nutrient-rich finger millet. High in calcium and iron. Perfect for healthy rotis and porridge.',
    inStock: true, isFlashSale: true, discount: 15,
  },
  {
    id: 'm2', name: 'Jowar (Sorghum)', category: 'millets', price: 75, originalPrice: null,
    image: '🌾', unit: '1 kg', description: 'Gluten-free whole sorghum grain. Rich in protein and fiber. Ideal for rotis and bhakri.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'm3', name: 'Bajra (Pearl Millet)', category: 'millets', price: 70, originalPrice: 85,
    image: '🌾', unit: '1 kg', description: 'Pearl millet rich in iron and magnesium. Traditional winter supergrain.',
    inStock: true, isFlashSale: true, discount: 18,
  },
  {
    id: 'm4', name: 'Foxtail Millet', category: 'millets', price: 120, originalPrice: null,
    image: '🌾', unit: '500 g', description: 'Low glycemic index millet. Great for diabetes-friendly meals and upma.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'm5', name: 'Little Millet', category: 'millets', price: 110, originalPrice: null,
    image: '🌾', unit: '500 g', description: 'Tiny nutrient-packed millet. High in fiber and perfect for weight management.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'm6', name: 'Barnyard Millet', category: 'millets', price: 115, originalPrice: 135,
    image: '🌾', unit: '500 g', description: 'Light and easily digestible millet. Rich in iron and perfect for fasting days.',
    inStock: true, isFlashSale: true, discount: 15,
  },
  {
    id: 'r1', name: 'Basmati Rice', category: 'rice', price: 220, originalPrice: 260,
    image: '🍚', unit: '1 kg', description: 'Premium long-grain basmati rice. Aromatic and fluffy. Ideal for biryani and pulao.',
    inStock: true, isFlashSale: true, discount: 15,
  },
  {
    id: 'r2', name: 'Sona Masoori Rice', category: 'rice', price: 140, originalPrice: null,
    image: '🍚', unit: '1 kg', description: 'Light and aromatic medium-grain rice. Daily staple for South Indian meals.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'r3', name: 'Brown Rice', category: 'rice', price: 160, originalPrice: 190,
    image: '🍚', unit: '1 kg', description: 'Unpolished whole grain rice. Rich in fiber and nutrients. Healthy alternative to white rice.',
    inStock: true, isFlashSale: true, discount: 16,
  },
  {
    id: 'r4', name: 'Raw Rice', category: 'rice', price: 130, originalPrice: null,
    image: '🍚', unit: '1 kg', description: 'Uncooked raw rice. Perfect for everyday cooking, idlis, and dosas.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'r5', name: 'Boiled Rice', category: 'rice', price: 120, originalPrice: null,
    image: '🍚', unit: '1 kg', description: 'Parboiled rice with retained nutrients. Fluffy texture. Ideal for daily meals.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'f1', name: 'Wheat Atta', category: 'flours', price: 55, originalPrice: null,
    image: '🌾', unit: '5 kg', description: 'Stone-ground whole wheat flour. Perfect for soft rotis and chapatis.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'f2', name: 'Ragi Flour', category: 'flours', price: 90, originalPrice: 110,
    image: '🌾', unit: '1 kg', description: 'Fine ragi flour from premium finger millets. Ideal for ragi mudde, dosa and rotis.',
    inStock: true, isFlashSale: true, discount: 18,
  },
  {
    id: 'f3', name: 'Jowar Flour', category: 'flours', price: 80, originalPrice: null,
    image: '🌾', unit: '1 kg', description: 'Gluten-free jowar flour. Perfect for bhakri and healthy rotis.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'f4', name: 'Bajra Flour', category: 'flours', price: 75, originalPrice: null,
    image: '🌾', unit: '1 kg', description: 'Traditional pearl millet flour. Rich in iron. Perfect for winter rotis.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'f5', name: 'Multigrain Flour', category: 'flours', price: 65, originalPrice: 80,
    image: '🌾', unit: '1 kg', description: 'Blend of wheat, jowar, bajra and ragi flours. Nutritious and delicious.',
    inStock: true, isFlashSale: true, discount: 19,
  },
  {
    id: 'p1', name: 'Toor Dal', category: 'pulses', price: 145, originalPrice: null,
    image: '🫘', unit: '1 kg', description: 'Premium split pigeon peas. Essential for daily sambar and dal tadka.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'p2', name: 'Moong Dal', category: 'pulses', price: 130, originalPrice: 155,
    image: '🫘', unit: '1 kg', description: 'Split green gram. Light and easy to digest. Perfect for khichdi and soup.',
    inStock: true, isFlashSale: true, discount: 16,
  },
  {
    id: 'p3', name: 'Chana Dal', category: 'pulses', price: 110, originalPrice: null,
    image: '🫘', unit: '1 kg', description: 'Split chickpea lentils. Rich in protein. Great for chutneys and curries.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'p4', name: 'Urad Dal', category: 'pulses', price: 150, originalPrice: null,
    image: '🫘', unit: '1 kg', description: 'Black gram lentils. Essential for creamy dal makhani and idli batter.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'p5', name: 'Masoor Dal', category: 'pulses', price: 125, originalPrice: null,
    image: '🫘', unit: '1 kg', description: 'Red lentils quick cooking. Rich in protein and fiber. Perfect for everyday dal.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 's1', name: 'Flax Seeds (Alsi)', category: 'seeds', price: 95, originalPrice: null,
    image: '🌰', unit: '250 g', description: 'Omega-3 rich brown flaxseeds. Great for weight management and heart health.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 's2', name: 'Chia Seeds', category: 'seeds', price: 180, originalPrice: 220,
    image: '🌰', unit: '200 g', description: 'Premium black chia seeds. Rich in antioxidants and fiber. Superfood for energy.',
    inStock: true, isFlashSale: true, discount: 18,
  },
  {
    id: 's3', name: 'Sunflower Seeds', category: 'seeds', price: 85, originalPrice: null,
    image: '🌰', unit: '200 g', description: 'Crunchy sunflower seeds. Rich in Vitamin E and healthy fats. Perfect for snacking.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 's4', name: 'Pumpkin Seeds', category: 'seeds', price: 120, originalPrice: 145,
    image: '🌰', unit: '200 g', description: 'Iron-rich pumpkin seeds. Great for immunity and better sleep.',
    inStock: true, isFlashSale: true, discount: 17,
  },
  {
    id: 's5', name: 'Sesame Seeds (Til)', category: 'seeds', price: 70, originalPrice: null,
    image: '🌰', unit: '200 g', description: 'Premium white sesame seeds. Rich in calcium. Essential for traditional sweets.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'x1', name: 'Millet Noodles', category: 'ready', price: 65, originalPrice: 80,
    image: '🍜', unit: '200 g', description: 'Healthy instant noodles made from millets. Cooks in 5 minutes. Guilt-free snacking.',
    inStock: true, isFlashSale: true, discount: 19,
  },
  {
    id: 'x2', name: 'Millet Pasta', category: 'ready', price: 75, originalPrice: null,
    image: '🍝', unit: '200 g', description: 'Whole grain millet pasta. High protein and fiber. Kids love it.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'x3', name: 'Ragi Dosa Mix', category: 'ready', price: 55, originalPrice: null,
    image: '🥞', unit: '500 g', description: 'Instant ragi dosa mix. Just add water and make crispy healthy dosas.',
    inStock: true, isFlashSale: false, discount: null,
  },
  {
    id: 'x4', name: 'Millet Upma Mix', category: 'ready', price: 60, originalPrice: 75,
    image: '🥣', unit: '500 g', description: 'Quick millet upma mix with vegetables. Traditional breakfast in minutes.',
    inStock: true, isFlashSale: true, discount: 20,
  },
];
