import { useEffect, useState } from "react";
import {
  getPosCart,
  POS_CART_STORAGE_KEY,
  POS_CART_UPDATED_EVENT,
  setPosCart
} from "../utils/cartStorage.js";

export const useOfflineCart = (key = "pos-cart") => {
  const [cart, setCart] = useState(() => {
    if (key === POS_CART_STORAGE_KEY) {
      return getPosCart();
    }
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (key === POS_CART_STORAGE_KEY) {
      setPosCart(cart, { notify: false });
      return;
    }
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, key]);

  useEffect(() => {
    if (key !== POS_CART_STORAGE_KEY) {
      return undefined;
    }

    const syncFromStorage = () => {
      setCart(getPosCart());
    };

    const onStorage = (event) => {
      if (event.key === POS_CART_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener(POS_CART_UPDATED_EVENT, syncFromStorage);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(POS_CART_UPDATED_EVENT, syncFromStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  return [cart, setCart];
};
