const POS_CART_KEY = "pos-cart";
const POS_CART_EVENT = "pos-cart:updated";

const readCart = () => {
  try {
    const raw = localStorage.getItem(POS_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCart = (cart, notify = true) => {
  localStorage.setItem(POS_CART_KEY, JSON.stringify(cart));
  if (notify) {
    window.dispatchEvent(new CustomEvent(POS_CART_EVENT, { detail: { size: cart.length } }));
  }
};

export const getPosCart = () => readCart();

export const setPosCart = (cart, options = {}) => {
  const { notify = true } = options;
  writeCart(Array.isArray(cart) ? cart : [], notify);
};

export const addProductToPosCart = (product) => {
  const cart = readCart();
  const currentStock = Number(product.stockQuantity || 0);
  const existing = cart.find((item) => item.productId === product.id);

  if (existing) {
    if (currentStock > 0 && existing.quantity >= currentStock) {
      return {
        ok: false,
        reason: "STOCK_LIMIT",
        cart
      };
    }

    const updated = cart.map((item) =>
      item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
    writeCart(updated);
    return { ok: true, quantity: (existing.quantity || 0) + 1, cart: updated };
  }

  const next = [
    ...cart,
    {
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1
    }
  ];
  writeCart(next);
  return { ok: true, quantity: 1, cart: next };
};

export const POS_CART_STORAGE_KEY = POS_CART_KEY;
export const POS_CART_UPDATED_EVENT = POS_CART_EVENT;
