import { Link, useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product.inStock) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="product-card card">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap" style={{ display: 'block', textDecoration: 'none' }}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className="product-card__badge">{product.badge}</span>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <span className="product-card__badge" style={{ background: '#dc2626', color: 'white', top: 'auto', bottom: 12 }}>Only {product.stock} pcs left!</span>
        )}
        <div className="product-card__overlay">
          <span className="product-card__quick-view btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
            Quick View
          </span>
        </div>
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{product.category}</span>
          {product.subcategory && (
            <span className="product-card__subcategory">• {product.subcategory}</span>
          )}
        </div>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-card__name" title={product.name}>{product.name}</h3>
        </Link>
        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>star</span>
            <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{product.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--on-surface-variant)' }}>({product.numReviews})</span>
          </div>
        )}
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <div className="product-card__price-wrap">
            <span className="product-card__price">₹{product.price.toFixed(2)}</span>
          </div>
          <button
            className={`product-card__add-btn btn btn-primary`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            style={{ opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {product.inStock ? 'visibility' : 'block'}
            </span>
            <span className="product-card__add-label">
              {product.inStock ? 'View Details' : 'Out of Stock'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
