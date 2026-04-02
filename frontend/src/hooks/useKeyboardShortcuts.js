import { useEffect } from "react";

export const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "F2") {
        event.preventDefault();
        handlers.onFocusSearch?.();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        handlers.onCheckout?.();
      }

      if (event.key === "Escape") {
        handlers.onEscape?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
};
