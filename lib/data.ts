// Demo catalog for the electronics storefront. All values are fictional UI content.

export type Category = {
  slug: string;
  name: string;
  count: number;
  tone: string; // tailwind gradient classes for the product tile
  blurb: string;
  image: string; // studio photo under public/categories
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string; // category slug
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  stockCount?: number;
  isNew?: boolean;
  isDeal?: boolean;
  isFlash?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  tone: string; // gradient tone for the tile
  image?: string; // studio photo path under /public/products, falls back to gradient tile
  tagline: string;
  attrs: Record<string, string>; // quick specs shown on cards / comparisons
  specs: { group: string; rows: [string, string][] }[]; // PDP specification table
};

export const ANNOUNCEMENT =
  "Free Delivery on Orders Over ৳5,000 • Official Warranty • Easy 7-Day Returns";

export const NAV_CATEGORIES = [
  "mobiles",
  "laptops",
  "computers",
  "tv-audio",
  "gaming",
  "cameras",
  "smart-devices",
  "accessories",
  "home-appliances",
];

export const CATEGORIES: Category[] = [
  { slug: "mobiles", name: "Smartphones", count: 428, tone: "from-sky-100 to-indigo-100", blurb: "Flagship & everyday phones", image: "/categories/mobiles.jpg" },
  { slug: "laptops", name: "Laptops", count: 312, tone: "from-slate-100 to-zinc-200", blurb: "Work, create, game", image: "/categories/laptops.jpg" },
  { slug: "tablets", name: "Tablets", count: 96, tone: "from-violet-100 to-fuchsia-100", blurb: "Big-screen productivity", image: "/categories/tablets.jpg" },
  { slug: "computers", name: "Desktop & PC", count: 154, tone: "from-neutral-100 to-stone-200", blurb: "Towers & all-in-ones", image: "/categories/computers.jpg" },
  { slug: "tv-audio", name: "TV & Audio", count: 210, tone: "from-amber-100 to-orange-100", blurb: "Home entertainment", image: "/categories/tv-audio.jpg" },
  { slug: "gaming", name: "Gaming", count: 187, tone: "from-violet-100 to-primary-100", blurb: "Gear for serious players", image: "/categories/gaming.jpg" },
  { slug: "cameras", name: "Cameras", count: 78, tone: "from-rose-100 to-pink-100", blurb: "Capture every moment", image: "/categories/cameras.jpg" },
  { slug: "smart-devices", name: "Smart Watches", count: 133, tone: "from-emerald-100 to-teal-100", blurb: "Wearable tech", image: "/categories/smart-devices.jpg" },
  { slug: "accessories", name: "Accessories", count: 540, tone: "from-cyan-100 to-sky-100", blurb: "Charge, protect, connect", image: "/categories/accessories.jpg" },
  { slug: "home-appliances", name: "Home Appliances", count: 165, tone: "from-lime-100 to-green-100", blurb: "Smart living", image: "/categories/home-appliances.jpg" },
];

export const BRANDS = [
  "Apple", "Samsung", "Sony", "LG", "Dell", "HP", "Lenovo",
  "ASUS", "Acer", "Xiaomi", "OnePlus", "JBL", "Anker", "Logitech",
  "Google", "Nothing",
];

// Official brand logo SVGs served from the Simple Icons CDN (verified slugs).
// Brands without an entry (Logitech, Anker, Nothing) render as a text tile.
export const BRAND_LOGOS: Record<string, string> = {
  Apple: "https://cdn.simpleicons.org/apple",
  Samsung: "https://cdn.simpleicons.org/samsung",
  Sony: "https://cdn.simpleicons.org/sony/171717", // original is white — request dark variant
  LG: "https://cdn.simpleicons.org/lg",
  Dell: "https://cdn.simpleicons.org/dell",
  HP: "https://cdn.simpleicons.org/hp",
  Lenovo: "https://cdn.simpleicons.org/lenovo",
  ASUS: "https://cdn.simpleicons.org/asus",
  Acer: "https://cdn.simpleicons.org/acer",
  Xiaomi: "https://cdn.simpleicons.org/xiaomi",
  OnePlus: "https://cdn.simpleicons.org/oneplus",
  JBL: "https://cdn.simpleicons.org/jbl",
  Google: "https://cdn.simpleicons.org/google",
};

export const CATEGORY_NAMES: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name]),
);

// Category-specific filter schema for the listing page.
export const FILTER_SCHEMA: Record<string, { key: string; label: string; options: string[] }[]> = {
  mobiles: [
    { key: "brand", label: "Brand", options: ["Apple", "Samsung", "Xiaomi", "OnePlus", "Google", "Nothing"] },
    { key: "RAM", label: "RAM", options: ["6GB", "8GB", "12GB", "16GB"] },
    { key: "Storage", label: "Storage", options: ["128GB", "256GB", "512GB", "1TB"] },
    { key: "5G", label: "5G", options: ["Yes", "No"] },
    { key: "Operating System", label: "Operating System", options: ["iOS", "Android"] },
  ],
  laptops: [
    { key: "brand", label: "Brand", options: ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer"] },
    { key: "RAM", label: "RAM", options: ["8GB", "16GB", "32GB"] },
    { key: "Storage", label: "Storage", options: ["256GB", "512GB", "1TB", "2TB"] },
    { key: "Processor", label: "Processor", options: ["Intel Core i5", "Intel Core i7", "AMD Ryzen 7", "Apple M-series"] },
  ],
  gaming: [
    { key: "brand", label: "Brand", options: ["ASUS", "Sony", "Logitech", "Samsung", "Dell"] },
    { key: "Category", label: "Gear Type", options: ["Laptop", "Console", "Monitor", "Keyboard", "Headset"] },
  ],
  "tv-audio": [
    { key: "brand", label: "Brand", options: ["Sony", "LG", "Samsung", "JBL"] },
    { key: "Display Size", label: "Display Size", options: ["43 inch", "55 inch", "65 inch", "75 inch"] },
  ],
};

const DEFAULT_FILTERS = [
  { key: "brand", label: "Brand", options: BRANDS.slice(0, 8) },
  { key: "price", label: "Price", options: [] },
];

export function filtersForCategory(slug: string) {
  return FILTER_SCHEMA[slug] ?? DEFAULT_FILTERS;
}

export const PRODUCTS: Product[] = [
  {
    id: "iphone-15-pro", name: "iPhone 15 Pro", brand: "Apple", category: "mobiles",
    price: 149999, oldPrice: 159999, rating: 4.8, reviews: 1284, inStock: true, stockCount: 6,
    isNew: true, isDeal: true, isBestSeller: true, isTrending: true, tone: "from-slate-200 to-slate-300",
    tagline: "Titanium. So strong. So light. So Pro.",
    attrs: { Display: "6.1\" OLED", Chip: "A17 Pro", Camera: "48MP", RAM: "8GB", Storage: "256GB", Battery: "3,274mAh" },
    specs: [
      { group: "Display", rows: [["Size", "6.1 inch Super Retina XDR"], ["Resolution", "2556 × 1179"], ["Refresh Rate", "120Hz ProMotion"]] },
      { group: "Performance", rows: [["Chip", "A17 Pro"], ["RAM", "8GB"], ["Storage", "256GB"]] },
      { group: "Camera", rows: [["Main", "48MP"], ["Ultra Wide", "12MP"], ["Telephoto", "12MP 3x"]] },
      { group: "Battery", rows: [["Capacity", "3,274mAh"], ["Charging", "USB-C 20W"]] },
    ],
  },
  {
    id: "galaxy-s24-ultra", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "mobiles",
    price: 139999, oldPrice: 149999, rating: 4.7, reviews: 968, inStock: true, stockCount: 12,
    isDeal: true, isBestSeller: true, isTrending: true, tone: "from-indigo-100 to-violet-200",
    tagline: "Galaxy AI is here. Square off with the ordinary.",
    attrs: { Display: "6.8\" AMOLED", Chip: "Snapdragon 8 Gen 3", Camera: "200MP", RAM: "12GB", Storage: "256GB", Battery: "5,000mAh" },
    specs: [
      { group: "Display", rows: [["Size", "6.8 inch QHD+ AMOLED"], ["Refresh Rate", "120Hz"]] },
      { group: "Performance", rows: [["Chip", "Snapdragon 8 Gen 3"], ["RAM", "12GB"], ["Storage", "256GB"]] },
      { group: "Camera", rows: [["Main", "200MP"], ["Ultra Wide", "12MP"], ["Telephoto", "50MP 5x"]] },
      { group: "Battery", rows: [["Capacity", "5,000mAh"], ["Charging", "45W wired"]] },
    ],
  },
  {
    id: "pixel-8", name: "Google Pixel 8", brand: "Google", category: "mobiles",
    price: 92999, oldPrice: 99999, rating: 4.6, reviews: 512, inStock: true, tone: "from-sky-100 to-blue-200",
    isDeal: true, isTrending: true,
    tagline: "The best of Google. Think different.",
    attrs: { Display: "6.2\" Actua", Chip: "Tensor G3", Camera: "50MP", RAM: "8GB", Storage: "128GB", Battery: "4,575mAh" },
    specs: [
      { group: "Display", rows: [["Size", "6.2 inch Actua OLED"], ["Refresh Rate", "120Hz"]] },
      { group: "Performance", rows: [["Chip", "Tensor G3"], ["RAM", "8GB"], ["Storage", "128GB"]] },
      { group: "Camera", rows: [["Main", "50MP"], ["Ultra Wide", "12MP"]] },
    ],
  },
  {
    id: "oneplus-12", name: "OnePlus 12", brand: "OnePlus", category: "mobiles",
    price: 74999, rating: 4.5, reviews: 340, inStock: false, tone: "from-red-100 to-rose-200",
    isNew: true,
    tagline: "Flagship performance with Hasselblad camera.",
    attrs: { Display: "6.82\" LTPO", Chip: "Snapdragon 8 Gen 3", Camera: "50MP", RAM: "12GB", Storage: "256GB", Battery: "5,400mAh" },
    specs: [
      { group: "Display", rows: [["Size", "6.82 inch 2K LTPO AMOLED"], ["Refresh Rate", "120Hz"]] },
      { group: "Performance", rows: [["Chip", "Snapdragon 8 Gen 3"], ["RAM", "12GB"], ["Storage", "256GB"]] },
      { group: "Battery", rows: [["Capacity", "5,400mAh"], ["Charging", "100W SUPERVOOC"]] },
    ],
  },
  {
    id: "nothing-phone-2a", name: "Nothing Phone (2a)", brand: "Nothing", category: "mobiles",
    price: 32999, rating: 4.3, reviews: 210, inStock: true, tone: "from-neutral-100 to-zinc-300",
    isNew: true, isBestSeller: true,
    tagline: "Bold. Minimal. Smart. The glyph interface.",
    attrs: { Display: "6.7\" OLED", Chip: "Dimensity 7200", Camera: "50MP", RAM: "8GB", Storage: "128GB", Battery: "5,000mAh" },
    specs: [
      { group: "Display", rows: [["Size", "6.7 inch OLED"], ["Refresh Rate", "120Hz"]] },
      { group: "Performance", rows: [["Chip", "MediaTek Dimensity 7200"], ["RAM", "8GB"], ["Storage", "128GB"]] },
    ],
  },
  {
    id: "macbook-pro-14", name: "MacBook Pro 14\" M3 Pro", brand: "Apple", category: "laptops",
    price: 249999, oldPrice: 264999, rating: 4.9, reviews: 742, inStock: true, stockCount: 4,
    isDeal: true, isBestSeller: true, isTrending: true, tone: "from-zinc-200 to-neutral-300",
    tagline: "Pro power. Mind-bending performance.",
    attrs: { Display: "14.2\" Liquid Retina XDR", CPU: "M3 Pro", RAM: "18GB", Storage: "512GB SSD", GPU: "18-core" },
    specs: [
      { group: "Display", rows: [["Size", "14.2 inch Liquid Retina XDR"], ["Resolution", "3024 × 1964"], ["Refresh Rate", "120Hz"]] },
      { group: "Performance", rows: [["CPU", "Apple M3 Pro"], ["GPU", "18-core"], ["RAM", "18GB"], ["Storage", "512GB SSD"]] },
      { group: "Battery", rows: [["Capacity", "72.6Wh"], ["Playback", "Up to 18h"]] },
    ],
  },
  {
    id: "dell-xps-13", name: "Dell XPS 13", brand: "Dell", category: "laptops",
    price: 134999, rating: 4.5, reviews: 318, inStock: true, tone: "from-slate-100 to-gray-200",
    isNew: true,
    tagline: "Ultra-portable. Uncompromising.",
    attrs: { Display: "13.4\" FHD+", CPU: "Intel Core i7", RAM: "16GB", Storage: "512GB SSD" },
    specs: [
      { group: "Display", rows: [["Size", "13.4 inch FHD+"], ["Touch", "Optional"]] },
      { group: "Performance", rows: [["CPU", "Intel Core i7-1360P"], ["RAM", "16GB"], ["Storage", "512GB SSD"]] },
    ],
  },
  {
    id: "asus-rog-strix", name: "ASUS ROG Strix G16", brand: "ASUS", category: "gaming",
    price: 189999, oldPrice: 209999, rating: 4.7, reviews: 456, inStock: true, stockCount: 3,
    isDeal: true, isBestSeller: true, tone: "from-violet-100 to-primary-100",
    tagline: "Win with next-level gaming performance.",
    attrs: { Display: "16\" QHD 240Hz", CPU: "Ryzen 9", RAM: "16GB", Storage: "1TB SSD", GPU: "RTX 4070" },
    specs: [
      { group: "Display", rows: [["Size", "16 inch QHD"], ["Refresh Rate", "240Hz"]] },
      { group: "Performance", rows: [["CPU", "AMD Ryzen 9 7945HX"], ["GPU", "NVIDIA RTX 4070"], ["RAM", "16GB"], ["Storage", "1TB SSD"]] },
    ],
  },
  {
    id: "lenovo-thinkpad", name: "Lenovo ThinkPad X1 Carbon", brand: "Lenovo", category: "laptops",
    price: 159999, rating: 4.6, reviews: 289, inStock: true, tone: "from-neutral-200 to-stone-300",
    tagline: "The ultimate business ultrabook.",
    attrs: { Display: "14\" WUXGA", CPU: "Intel Core i7", RAM: "16GB", Storage: "512GB SSD" },
    specs: [
      { group: "Display", rows: [["Size", "14 inch WUXGA"]] },
      { group: "Performance", rows: [["CPU", "Intel Core i7-1365U"], ["RAM", "16GB"], ["Storage", "512GB SSD"]] },
    ],
  },
  {
    id: "hp-spectre", name: "HP Spectre x360", brand: "HP", category: "laptops",
    price: 144999, oldPrice: 154999, rating: 4.4, reviews: 176, inStock: true, isDeal: true, tone: "from-rose-100 to-slate-200",
    tagline: "Premium 2-in-1 convertible.",
    attrs: { Display: "16\" OLED", CPU: "Intel Core i7", RAM: "16GB", Storage: "1TB SSD" },
    specs: [
      { group: "Display", rows: [["Size", "16 inch OLED touch"]] },
      { group: "Performance", rows: [["CPU", "Intel Core i7"], ["RAM", "16GB"], ["Storage", "1TB SSD"]] },
    ],
  },
  {
    id: "lg-oled-c4", name: "LG OLED evo C4 55\"", brand: "LG", category: "tv-audio",
    price: 174999, oldPrice: 199999, rating: 4.8, reviews: 402, inStock: true, stockCount: 5,
    isDeal: true, isTrending: true, tone: "from-amber-100 to-orange-100",
    tagline: "Perfect blacks. Infinite contrast.",
    attrs: { Display: "55\" OLED 4K", Refresh: "144Hz", HDR: "Dolby Vision", System: "webOS" },
    specs: [
      { group: "Display", rows: [["Size", "55 inch OLED evo"], ["Resolution", "4K (3840 × 2160)"], ["Refresh Rate", "144Hz"]] },
      { group: "Features", rows: [["HDR", "Dolby Vision"], ["OS", "webOS 24"]] },
    ],
  },
  {
    id: "samsung-neo-qled", name: "Samsung Neo QLED 65\"", brand: "Samsung", category: "tv-audio",
    price: 159999, rating: 4.6, reviews: 231, inStock: true, tone: "from-blue-100 to-indigo-200",
    isBestSeller: true,
    tagline: "Brilliant brightness. Quantum precision.",
    attrs: { Display: "65\" Neo QLED 4K", Refresh: "120Hz", HDR: "Quantum HDR" },
    specs: [
      { group: "Display", rows: [["Size", "65 inch Neo QLED"], ["Resolution", "4K"], ["Refresh Rate", "120Hz"]] },
    ],
  },
  {
    id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", brand: "Sony", category: "tv-audio",
    price: 38999, oldPrice: 42999, rating: 4.8, reviews: 1520, inStock: true,
    isDeal: true, isBestSeller: true, isTrending: true, tone: "from-neutral-200 to-zinc-300",
    tagline: "Industry-leading noise cancellation.",
    attrs: { Type: "Over-ear", ANC: "Yes", Battery: "30h", Codec: "LDAC" },
    specs: [
      { group: "Audio", rows: [["Driver", "30mm"], ["Codec", "LDAC, AAC, SBC"]] },
      { group: "Battery", rows: [["Playback", "30h with ANC"], ["Charging", "3min = 3h"]] },
    ],
  },
  {
    id: "jbl-flip-6", name: "JBL Flip 6 Speaker", brand: "JBL", category: "tv-audio",
    price: 14999, rating: 4.5, reviews: 890, inStock: true, tone: "from-orange-100 to-red-200",
    isBestSeller: true,
    tagline: "Bold JBL Original Pro Sound.",
    attrs: { Output: "30W", Battery: "12h", Rating: "IP67" },
    specs: [
      { group: "Audio", rows: [["Output", "30W RMS"]] },
      { group: "Battery", rows: [["Playback", "12h"], ["Waterproof", "IP67"]] },
    ],
  },
  {
    id: "sony-ps5", name: "PlayStation 5 Slim", brand: "Sony", category: "gaming",
    price: 69999, oldPrice: 74999, rating: 4.9, reviews: 2103, inStock: true, stockCount: 2,
    isDeal: true, isBestSeller: true, isTrending: true, tone: "from-zinc-100 to-blue-200",
    tagline: "Play has no limits.",
    attrs: { Storage: "1TB SSD", Output: "4K 120Hz", Disc: "Digital" },
    specs: [
      { group: "Performance", rows: [["CPU", "AMD Ryzen Zen 2"], ["GPU", "10.28 TFLOPs"], ["Storage", "1TB SSD"]] },
      { group: "Video", rows: [["Output", "Up to 4K 120Hz"]] },
    ],
  },
  {
    id: "logitech-g-pro", name: "Logitech G PRO X Superlight 2", brand: "Logitech", category: "gaming",
    price: 16999, rating: 4.7, reviews: 640, inStock: true, tone: "from-neutral-100 to-zinc-200",
    isNew: true,
    tagline: "Weightless champion. Made for esports.",
    attrs: { Weight: "60g", Sensor: "HERO 2", Battery: "95h" },
    specs: [
      { group: "Specs", rows: [["Weight", "60g"], ["Sensor", "HERO 2 (32K)"], ["Battery", "95h"]] },
    ],
  },
  {
    id: "dell-g27-monitor", name: "Dell G27 4K Gaming Monitor", brand: "Dell", category: "gaming",
    price: 44999, oldPrice: 49999, rating: 4.5, reviews: 188, inStock: true, isDeal: true, tone: "from-slate-200 to-neutral-300",
    tagline: "Console-grade 4K gaming.",
    attrs: { Display: "27\" 4K", Refresh: "144Hz", Panel: "IPS" },
    specs: [
      { group: "Display", rows: [["Size", "27 inch"], ["Resolution", "4K UHD"], ["Refresh Rate", "144Hz"]] },
    ],
  },
  {
    id: "apple-watch-9", name: "Apple Watch Series 9", brand: "Apple", category: "smart-devices",
    price: 44999, rating: 4.7, reviews: 534, inStock: true, tone: "from-rose-100 to-pink-200",
    isNew: true, isTrending: true,
    tagline: "Smarter. Brighter. Mightier.",
    attrs: { Display: "41mm Retina", Chip: "S9", Battery: "18h" },
    specs: [
      { group: "Display", rows: [["Size", "41mm Retina LTPO OLED"]] },
      { group: "Performance", rows: [["Chip", "Apple S9"], ["Battery", "18h"]] },
    ],
  },
  {
    id: "samsung-galaxy-buds3", name: "Samsung Galaxy Buds3 Pro", brand: "Samsung", category: "smart-devices",
    price: 19999, oldPrice: 22999, rating: 4.4, reviews: 275, inStock: true, isDeal: true, tone: "from-indigo-100 to-sky-200",
    tagline: "Sound that adapts to you.",
    attrs: { ANC: "Yes", Battery: "26h", Codec: "SSC" },
    specs: [
      { group: "Audio", rows: [["ANC", "Adaptive"], ["Codec", "Samsung Seamless Codec"]] },
      { group: "Battery", rows: [["Total", "26h with case"]] },
    ],
  },
  {
    id: "sony-a7iv", name: "Sony Alpha 7 IV", brand: "Sony", category: "cameras",
    price: 219999, rating: 4.8, reviews: 156, inStock: true, tone: "from-neutral-200 to-stone-300",
    isBestSeller: true,
    tagline: "Full-frame hybrid excellence.",
    attrs: { Sensor: "33MP FF", Video: "4K 60p", Mount: "E-mount" },
    specs: [
      { group: "Sensor", rows: [["Resolution", "33MP full-frame"], ["Video", "4K 60p"]] },
    ],
  },
  {
    id: "anker-charger", name: "Anker 737 Charger 120W", brand: "Anker", category: "accessories",
    price: 7999, oldPrice: 8999, rating: 4.6, reviews: 1120, inStock: true, isDeal: true, isBestSeller: true, tone: "from-lime-100 to-emerald-200",
    tagline: "Charge three devices at once.",
    attrs: { Output: "120W", Ports: "2C + 1A", Tech: "GaNPrime" },
    specs: [
      { group: "Specs", rows: [["Total output", "120W"], ["Ports", "USB-C ×2, USB-A ×1"]] },
    ],
  },
  {
    id: "ipad-air", name: "iPad Air 11\" M2", brand: "Apple", category: "tablets",
    price: 89999, rating: 4.7, reviews: 398, inStock: true, isNew: true, tone: "from-sky-100 to-indigo-200",
    tagline: "Powerful. Versatile. Familiar.",
    attrs: { Display: "11\" Liquid Retina", Chip: "M2", Storage: "128GB" },
    specs: [
      { group: "Display", rows: [["Size", "11 inch Liquid Retina"]] },
      { group: "Performance", rows: [["Chip", "Apple M2"], ["Storage", "128GB"]] },
    ],
  },
  {
    id: "xiaomi-smart-tv", name: "Xiaomi Smart TV X 43\"", brand: "Xiaomi", category: "tv-audio",
    price: 34999, oldPrice: 39999, rating: 4.3, reviews: 512, inStock: true, isDeal: true, tone: "from-neutral-100 to-gray-200",
    tagline: "4QLED. Vivid value.",
    attrs: { Display: "43\" 4K QLED", System: "Google TV" },
    specs: [
      { group: "Display", rows: [["Size", "43 inch 4K QLED"]] },
      { group: "Features", rows: [["OS", "Google TV"]] },
    ],
  },
  {
    id: "acer-predator", name: "Acer Predator Helios 16", brand: "Acer", category: "gaming",
    price: 209999, rating: 4.6, reviews: 142, inStock: true, stockCount: 7, tone: "from-cyan-100 to-teal-100",
    isTrending: true,
    tagline: "Dominate every game.",
    attrs: { Display: "16\" WQXGA 240Hz", CPU: "Intel i9", RAM: "32GB", Storage: "2TB SSD", GPU: "RTX 4080" },
    specs: [
      { group: "Display", rows: [["Size", "16 inch WQXGA"], ["Refresh Rate", "240Hz"]] },
      { group: "Performance", rows: [["CPU", "Intel Core i9-14900HX"], ["GPU", "RTX 4080"], ["RAM", "32GB"], ["Storage", "2TB SSD"]] },
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

// Every product ships an original studio photo named after its id (public/products/<id>.jpg).
for (const p of PRODUCTS) p.image = `/products/${p.id}.jpg`;

export function byCategory(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

export const HERO_SLIDES = [
  { eyebrow: "Power Duo", title: "Charging Essentials", offer: "Up to ৳200 off", subtitle: "Fast chargers, power banks & cables from brands you trust.", cta: "Shop Now", href: "/category/accessories", poster: "/hero/hero-charging.jpg" },
  { eyebrow: "Mega Sale", title: "Flagship Smartphones", offer: "৳5,000 instant discount", subtitle: "The most powerful phones, engineered to feel effortless.", cta: "Explore Deals", href: "/category/mobiles", poster: "/hero/hero-phone-sale.jpg" },
  { eyebrow: "Game On", title: "Ultimate Gaming Setup", offer: "Save up to ৳37,000", subtitle: "Laptops, monitors & gear built for every workflow.", cta: "Shop Gaming", href: "/gaming", poster: "/hero/hero-gaming.jpg" },
];

// Two stacked promo cards shown right of the hero carousel.
export const HERO_SIDE_PROMOS = {
  happyHour: { image: "/hero/promo-happy-hour.jpg", title: "Exclusive Deals", time: "10:00 PM – 12:00 AM", href: "/deals" },
  proSound: { image: "/hero/promo-earbuds-light.jpg", title: "Pro Sound", price: "Only @ ৳19,999", product: "Galaxy Buds3 Pro (USB-C)", href: "/product/samsung-galaxy-buds3" },
};

export const PROMO_BANNERS = [
  { title: "Ultimate Gaming", text: "Build your dream setup", cta: "Explore Gaming", href: "/gaming", image: "/promos/promo-gaming.jpg", tone: "from-violet-100 to-indigo-100" },
  { title: "Work From Anywhere", text: "Laptops, monitors & accessories", cta: "Shop Work Setup", href: "/category/laptops", image: "/promos/promo-work.jpg", tone: "from-sky-100 to-blue-100" },
  { title: "Smart Living", text: "Upgrade your home", cta: "Explore Smart Home", href: "/smart-home", image: "/promos/promo-smart.jpg", tone: "from-emerald-100 to-teal-100" },
  { title: "Immersive Audio", text: "Sound better. Live better.", cta: "Shop Audio", href: "/category/tv-audio", image: "/promos/promo-audio.jpg", tone: "from-amber-100 to-orange-100" },
];

export type Review = { name: string; rating: number; text: string; product: string; initials: string };
export const REVIEWS: Review[] = [
  { name: "Rahim Ahmed", rating: 5, text: "Genuinely impressed — delivery was next-day and the product was sealed with full warranty.", product: "iPhone 15 Pro", initials: "RA" },
  { name: "Sadia Karim", rating: 5, text: "Best electronics store I've used in Dhaka. Prices are honest and support actually replies.", product: "Sony WH-1000XM5", initials: "SK" },
  { name: "Tanvir Hasan", rating: 4, text: "Great gaming laptop, ran exactly as described. Would buy again for the warranty alone.", product: "ASUS ROG Strix G16", initials: "TH" },
  { name: "Nusrat Jahan", rating: 5, text: "The OLED TV is stunning. Packaging was careful and setup support helped over the phone.", product: "LG OLED evo C4", initials: "NJ" },
];

export type Order = {
  id: string;
  date: string;
  status: "delivered" | "shipped" | "processing" | "confirmed";
  items: { name: string; qty: number; price: number }[];
  total: number;
};
export const ORDERS: Order[] = [
  {
    id: "ELX-20260928-00125", date: "26 Sep 2026", status: "shipped",
    items: [{ name: "Sony WH-1000XM5", qty: 1, price: 38999 }, { name: "Anker 737 Charger 120W", qty: 1, price: 7999 }],
    total: 46998,
  },
  {
    id: "ELX-20260914-00098", date: "12 Sep 2026", status: "delivered",
    items: [{ name: "JBL Flip 6 Speaker", qty: 2, price: 14999 }],
    total: 29998,
  },
  {
    id: "ELX-20260902-00061", date: "01 Sep 2026", status: "processing",
    items: [{ name: "MacBook Pro 14\" M3 Pro", qty: 1, price: 249999 }],
    total: 249999,
  },
];
