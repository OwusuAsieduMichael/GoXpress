const FOOD_SKU_PATTERN = /^FD(\d{3})$/i;

const basePrefix = (() => {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") {
    return "";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
})();

const withBase = (path) => {
  if (!path) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${basePrefix}${path}`;
  }

  return `${basePrefix}/${path}`;
};

export const inlineFallbackImage = (name, category = "Product") => {
  const safeName = (name || "Product")
    .replace(/&/g, "and")
    .replace(/</g, "")
    .replace(/>/g, "");
  const safeCategory = (category || "Product")
    .replace(/&/g, "and")
    .replace(/</g, "")
    .replace(/>/g, "");

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'>
    <defs>
      <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
        <stop offset='0%' stop-color='#FFF1E6'/>
        <stop offset='100%' stop-color='#FFD8B8'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <circle cx='300' cy='160' r='54' fill='#FF8D2F' opacity='0.18'/>
    <text x='300' y='235' text-anchor='middle' font-family='Arial' font-size='28' fill='#FF8D2F'>${safeName}</text>
    <text x='300' y='272' text-anchor='middle' font-family='Arial' font-size='18' fill='#1F2A44'>${safeCategory}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const localFoodImageBySku = (sku) => {
  const match = String(sku || "").match(FOOD_SKU_PATTERN);
  if (!match) {
    return "";
  }

  const index = Number(match[1]);
  if (!Number.isInteger(index) || index < 1 || index > 20) {
    return "";
  }

  return withBase(`/products/ghana-foods/food-${String(index).padStart(2, "0")}.svg`);
};

export const resolveProductImage = (product) => {
  // Prioritize database imageUrl first
  if (product?.imageUrl) {
    return withBase(product.imageUrl);
  }

  // Fallback to old food SVGs if no imageUrl
  const localFood = localFoodImageBySku(product?.sku);
  if (localFood) {
    return localFood;
  }

  return inlineFallbackImage(product?.name, product?.categoryName);
};
