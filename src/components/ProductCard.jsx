import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, updateStore } from '../store';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const store = useStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product.inStock) return;
    
    const existing = store.cart.find(item => String(item.id) === String(product.id));
    let newCart;
    if (existing) {
      newCart = store.cart.map(item => String(item.id) === String(product.id) ? { ...item, qty: item.qty + 1 } : item);
    } else {
      newCart = [...store.cart, { id: product.id, qty: 1 }];
    }
    updateStore('cart', newCart);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card card">
      <div className="product-card__image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className="product-card__badge">{product.badge}</span>
        )}
        <div className="product-card__overlay">
          <button className="product-card__quick-view btn">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
            Quick View
          </button>
        </div>
      </div>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{product.category}</span>
          {product.subcategory && (
            <span className="product-card__subcategory">• {product.subcategory}</span>
          )}
        </div>
        <h3 className="product-card__name" title={product.name}>{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <div className="product-card__price-wrap">
            <span className="product-card__price">${product.price.toFixed(2)}</span>
          </div>
          <button
            className={`product-card__add-btn btn btn-primary ${added ? 'product-card__add-btn--added' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            style={{ opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {added ? 'check_circle' : (product.inStock ? 'shopping_basket' : 'block')}
            </span>
            <span className="product-card__add-label">
              {added ? 'Added' : (product.inStock ? 'Add to Cart' : 'Out of Stock')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
