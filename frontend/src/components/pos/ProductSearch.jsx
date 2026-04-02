import { currency } from "../../utils/format.js";
import { inlineFallbackImage, resolveProductImage } from "../../utils/productImage.js";

const ProductSearch = ({
  products,
  searchTerm,
  onSearchChange,
  barcodeInput,
  onBarcodeChange,
  onBarcodeSubmit,
  onAddToCart,
  searchRef
}) => (
  <section className="panel">
    <header className="panel-header">
      <h2>Product Search</h2>
    </header>

    <div className="grid two">
      <label>
        Search product
        <input
          ref={searchRef}
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name / SKU / barcode"
        />
      </label>
      <label>
        Barcode / SKU
        <input
          value={barcodeInput}
          onChange={(event) => onBarcodeChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onBarcodeSubmit();
            }
          }}
          placeholder="Scan barcode or enter SKU (e.g., FD001)"
        />
      </label>
    </div>

    <div className="product-grid">
      {products.map((product) => (
        <article
          key={product.id}
          className={`product-card ${product.stockQuantity <= 0 ? "out-of-stock" : ""}`}
        >
          <img
            src={resolveProductImage(product)}
            alt={product.name}
            className="product-card-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = inlineFallbackImage(
                product.name,
                product.categoryName
              );
            }}
          />
          <h4>{product.name}</h4>
          <p className="product-desc">{product.description || "No description available"}</p>
          <p>{product.sku}</p>
          <p className="product-price">{currency(product.price)}</p>
          <small>
            Stock: {product.stockQuantity}
            {product.stockQuantity <= product.lowStockThreshold ? " (Low)" : ""}
          </small>
          <button
            type="button"
            className="product-add-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.stockQuantity <= 0}
          >
            {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </article>
      ))}
      {products.length === 0 ? <p>No matching products.</p> : null}
    </div>
  </section>
);

export default ProductSearch;
