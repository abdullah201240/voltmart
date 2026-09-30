"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProduct, type Product, type ProductVariantItem } from "./data";

export type CartItem = { id: string; qty: number; variant?: string };
export type CartLine = {
  item: CartItem;
  product: Product;
  variantItem?: ProductVariantItem;
  sku: string;
  lineTotal: number;
};
export type Toast = { id: number; message: string; tone: "success" | "info" };

type StoreValue = {
  cart: CartItem[];
  wishlist: string[];
  compare: string[];
  recent: string[];
  cartCount: number;
  subtotal: number;
  addToCart: (id: string, qty?: number, variant?: string) => void;
  updateQty: (id: string, qty: number, variant?: string) => void;
  removeFromCart: (id: string, variant?: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  toggleCompare: (id: string) => void;
  pushRecent: (id: string) => void;
  toasts: Toast[];
  notify: (message: string, tone?: "success" | "info") => void;
  dismissToast: (id: number) => void;
};

const StoreCtx = createContext<StoreValue | null>(null);

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const toastId = useRef(0);

  // Hydrate from localStorage once on mount (keeps SSR markup stable).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCart(load<CartItem[]>("sf_cart", []));
    setWishlist(load<string[]>("sf_wishlist", []));
    setCompare(load<string[]>("sf_compare", []));
    setRecent(load<string[]>("sf_recent", []));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("sf_cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("sf_wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("sf_compare", JSON.stringify(compare));
  }, [compare, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("sf_recent", JSON.stringify(recent));
  }, [recent, hydrated]);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: "success" | "info" = "success") => {
      const id = ++toastId.current;
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => dismissToast(id), 2600);
    },
    [dismissToast],
  );

  const addToCart = useCallback(
    (id: string, qty = 1, variant?: string) => {
      setCart((prev) => {
        const found = prev.find((i) => i.id === id && i.variant === variant);
        if (found) {
          return prev.map((i) =>
            i.id === id && i.variant === variant ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { id, qty, variant }];
      });
      const p = getProduct(id);
      notify(`Added ${p ? p.name : "item"} to cart`);
    },
    [notify],
  );

  const updateQty = useCallback((id: string, qty: number, variant?: string) => {
    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((i) => !(i.id === id && (variant !== undefined ? i.variant === variant : true)));
      }
      return prev.map((i) =>
        i.id === id && (variant !== undefined ? i.variant === variant : true)
          ? { ...i, qty }
          : i
      );
    });
  }, []);

  const removeFromCart = useCallback((id: string, variant?: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.id === id && (variant !== undefined ? i.variant === variant : true)))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) => {
        const has = prev.includes(id);
        const p = getProduct(id);
        notify(has ? `Removed ${p?.name ?? "item"} from wishlist` : `Saved ${p?.name ?? "item"} to wishlist`, "info");
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [notify],
  );

  const toggleCompare = useCallback(
    (id: string) => {
      setCompare((prev) => {
        const has = prev.includes(id);
        if (!has && prev.length >= 4) {
          notify("You can compare up to 4 products", "info");
          return prev;
        }
        return has ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [notify],
  );

  const pushRecent = useCallback((id: string) => {
    setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  }, []);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);
  const subtotal = useMemo(
    () =>
      cart.reduce((sum, i) => {
        const p = getProduct(i.id);
        if (!p) return sum;
        const v = p.variants?.find((varItem) => varItem.title === i.variant);
        const price = v ? v.price : p.price;
        return sum + price * i.qty;
      }, 0),
    [cart],
  );

  const value: StoreValue = {
    cart, wishlist, compare, recent, cartCount, subtotal,
    addToCart, updateQty, removeFromCart, clearCart,
    toggleWishlist, toggleCompare, pushRecent,
    toasts, notify, dismissToast,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Convenience: hydrate a cart line into its product + resolved values.
export function useCartLines(): CartLine[] {
  const { cart } = useStore();
  const lines: CartLine[] = [];
  for (const item of cart) {
    const product = getProduct(item.id);
    if (!product) continue;
    const v = product.variants?.find((varItem) => varItem.title === item.variant);
    const effectivePrice = v ? v.price : product.price;
    const effectiveImage = v?.image || product.image;
    const effectiveSku = v?.sku || product.id.toUpperCase();
    const resolvedProduct: Product = v
      ? {
          ...product,
          price: effectivePrice,
          oldPrice: v.oldPrice || product.oldPrice,
          image: effectiveImage,
        }
      : product;
    lines.push({
      item,
      product: resolvedProduct,
      variantItem: v,
      sku: effectiveSku,
      lineTotal: effectivePrice * item.qty,
    });
  }
  return lines;
}
