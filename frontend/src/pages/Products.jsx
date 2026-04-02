import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productsService } from "../services/productsService.js";
import { currency } from "../utils/format.js";
import { inlineFallbackImage, resolveProductImage } from "../utils/productImage.js";
import { addProductToPosCart } from "../utils/cartStorage.js";
import { usePermissions } from "../hooks/usePermissions.js";

const badgeLabels = ["Top Rated", "Best Seller", "Premium", "New"];

const hash = (text) => {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) {
    value = (value * 31 + text.charCodeAt(i)) % 100000;
  }
  return value;
};

const cardMeta = (product) => {
  const seed = hash(product.sku || product.name || "seed");
  const discount = 10 + (seed % 19);
  const rating = (4 + ((seed % 10) / 10)).toFixed(1);
  const reviews = 700 + (seed % 3000);
  const badge = badgeLabels[seed % badgeLabels.length];
  const originalPrice = Number(product.price) * (1 + discount / 100);
  const leftCount = Math.max(1, Number(product.stockQuantity || 0));
  const imageFallback = `https://placehold.co/600x450/FFF1E6/FF8D2F?text=GH+${encodeURIComponent(
    product.name || product.sku || "Product"
  )}`;

  return {
    badge,
    discount,
    rating,
    reviews,
    originalPrice,
    leftCount,
    imageFallback
  };
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [categoryRows, productRows] = await Promise.all([
          productsService.getCategories(),
          productsService.getAll({ search, includeInactive: false })
        ]);
        setCategories(categoryRows);
        setProducts(productRows);
        
        // Update cart count
        updateCartCount();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params = {
          search,
          includeInactive: false,
          categoryId: selectedCategory === "all" ? undefined : selectedCategory
        };
        const rows = await productsService.getAll(params);
        setProducts(rows);
      } catch (err) {
        setError(err.message);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("pos-cart") || "[]");
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch {
      setCartCount(0);
    }
  };

  const handleAddToCart = (product) => {
    setError("");
    setSuccessMessage("");

    if (Number(product.stockQuantity || 0) <= 0) {
      setError(`${product.name} is out of stock`);
      return;
    }

    const result = addProductToPosCart(product);
    if (!result.ok && result.reason === "STOCK_LIMIT") {
      setError(`Stock limit reached for ${product.name}`);
      return;
    }

    setSuccessMessage(`${product.name} added to cart`);
    updateCartCount();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const groupedProducts = useMemo(() => {
    const map = new Map();

    if (selectedCategory !== "all") {
      const category = categories.find((item) => item.id === selectedCategory);
      map.set(category?.name || "Products", products);
      return map;
    }

    categories.forEach((category) => {
      const rows = products.filter((product) => product.categoryId === category.id);
      if (rows.length > 0) {
        map.set(category.name, rows);
      }
    });

    const uncategorized = products.filter((product) => !product.categoryId);
    if (uncategorized.length > 0) {
      map.set("Uncategorized", uncategorized);
    }

    return map;
  }, [categories, products, selectedCategory]);

  return (
    <section className="stack">
      <header className="page-head">
        <h1>Product Catalog</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            className="catalog-search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ minWidth: "300px" }}
          />
          {cartCount > 0 && (
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate("/pos")}
              style={{ display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
            >
              <span className="material-icons-outlined" style={{ fontSize: "20px" }}>
                shopping_cart
              </span>
              View Cart ({cartCount})
            </button>
          )}
        </div>
      </header>

      <div className="catalog-category-bar">
        <button
          type="button"
          className={selectedCategory === "all" ? "cat-chip active" : "cat-chip"}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={selectedCategory === category.id ? "cat-chip active" : "cat-chip"}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      {loading ? <p>Loading products...</p> : null}

      {[...groupedProducts.entries()].map(([categoryName, rows]) => (
        <article className="catalog-section" key={categoryName}>
          <header className="catalog-section-head">
            <h2>{categoryName}</h2>
            <span>{rows.length} items</span>
          </header>

          <div className="catalog-grid">
            {rows.map((product) => {
              const meta = cardMeta(product);
              return (
                <article className="catalog-card" key={product.id}>
                  <div className="catalog-image-wrap">
                    <img
                      src={resolveProductImage(product) || meta.imageFallback}
                      alt={product.name}
                      className="catalog-image"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = inlineFallbackImage(
                          product.name,
                          product.categoryName
                        );
                      }}
                    />
                    <span className="catalog-badge">{meta.badge}</span>
                    <span className="catalog-discount">-{meta.discount}%</span>
                  </div>

                  <div className="catalog-body">
                    <p className="catalog-brand">
                      {(product.categoryName || "Product").toUpperCase()}
                    </p>
                    <h3>{product.name}</h3>
                    <p className="catalog-desc">
                      {product.description || "No description available for this product."}
                    </p>

                    <p className="catalog-rating">
                      {"★".repeat(4)}☆{" "}
                      <span>
                        ({meta.reviews.toLocaleString()} reviews, {meta.rating})
                      </span>
                    </p>

                    <div className="catalog-price-row">
                      <strong>{currency(product.price)}</strong>
                      <span>{currency(meta.originalPrice)}</span>
                    </div>

                    <p className="catalog-left">{meta.leftCount} left</p>

                    <button
                      type="button"
                      className="catalog-add-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={Number(product.stockQuantity || 0) <= 0}
                    >
                      {Number(product.stockQuantity || 0) > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                    
                    {!permissions.isCashier && (
                      <p className="muted-text" style={{ fontSize: "0.8rem", marginTop: "8px", textAlign: "center" }}>
                        Admin/Manager: Edit options available in management view
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
};

export default ProductsPage;
