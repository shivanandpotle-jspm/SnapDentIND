import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore, updateStore } from '../store';
import { useAuth } from '../context/AuthContext';
import { addToCart } from '../api/cart';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const { isAuthenticated } = useAuth();
  const { products, cart } = store;

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = products.find(p => String(p.id) === String(id));
    if (found) {
      setProduct(found);
    } else {
      if (products.length > 0) {
        navigate('/shop');
      }
    }
  }, [id, products, navigate]);

  if (!product) {
    return <div className="product-detail-loading">Loading product details...</div>;
  }

  // Mock sizes based on category
  let mockSizes = [];
  if (product.category === 'Restorative Dentistry') {
    mockSizes = ['A1', 'A2', 'A3', 'B1']; 
  } else if (product.category === 'Implant Surgical Accessories' || product.category === 'Implantology') {
    mockSizes = ['3.5mm', '4.0mm', '4.5mm', '5.0mm']; 
  } else if (product.category === 'Endodontics') {
    mockSizes = ['21mm', '25mm', '31mm']; 
  } else if (product.category === 'Dental Instruments') {
    mockSizes = ['Standard'];
  } else {
    mockSizes = ['Standard', 'Large'];
  }

  const handleAddToCart = async () => {
    if (!product.inStock) return;
    if (mockSizes.length > 0 && mockSizes[0] !== 'Standard' && !selectedSize) {
      alert('Please select an option first.');
      return;
    }

    const existing = cart.find(item => String(item.id) === String(product.id));
    let newCart;
    if (existing) {
      newCart = cart.map(item => String(item.id) === String(product.id) ? { ...item, qty: item.qty + qty } : item);
    } else {
      newCart = [...cart, { id: product.id, qty }];
    }
    updateStore('cart', newCart);

    if (isAuthenticated) {
      try {
        const data = await addToCart(product.id, qty);
        updateStore('cart', data.cart);
      } catch (err) {
        console.error('Failed to add to backend cart', err);
      }
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <main className="product-detail-page container-max section-gap animate-fade-in-up">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt; <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail-grid">
        <div className="product-detail-image-col">
          <div className="product-detail-image-wrap">
            <img src={product.image} alt={product.name} />
            {product.badge && <span className="product-detail-badge">{product.badge}</span>}
          </div>
        </div>

        <div className="product-detail-info-col">
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            {product.subcategory && <span className="product-subcategory">• {product.subcategory}</span>}
          </div>
          
          <h1 className="product-title">{product.name}</h1>
          <p className="product-price">₹{product.price.toFixed(2)}</p>
          <p className="product-short-desc">{product.description}</p>
          
          <div className="product-divider"></div>

          {mockSizes.length > 0 && mockSizes[0] !== 'Standard' && (
            <div className="product-options">
              <h3 className="options-title">
                {product.category === 'Restorative Dentistry' ? 'Select Shade' : 'Select Size/Option'}
              </h3>
              <div className="options-grid">
                {mockSizes.map(size => (
                  <button 
                    key={size}
                    className={`option-btn ${selectedSize === size ? 'option-btn--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-actions">
            <div className="qty-selector">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
              <input type="number" value={qty} readOnly />
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            
            <button 
              className={`btn btn-primary add-to-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <span className="material-symbols-outlined">
                {added ? 'check_circle' : (product.inStock ? 'shopping_cart' : 'block')}
              </span>
              {added ? 'Added to Cart' : (product.inStock ? 'Add to Cart' : 'Out of Stock')}
            </button>
          </div>

          <div className="product-status">
            {product.inStock && product.stock > store.settings.lowStockThreshold ? (
              <span className="status-in-stock"><span className="status-dot"></span> In Stock</span>
            ) : product.inStock && product.stock <= store.settings.lowStockThreshold ? (
              <span className="status-in-stock" style={{ color: '#f59e0b' }}>
                <span className="status-dot" style={{ background: '#f59e0b', boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)' }}></span> 
                Only {product.stock} left in stock - order soon.
              </span>
            ) : (
              <span className="status-out-stock"><span className="status-dot out"></span> Out of Stock</span>
            )}
          </div>
        </div>
      </div>

      <div className="product-tabs">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping & Returns
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="tab-pane animate-fade-in-up">
              <h3>About this product</h3>
              <p>{product.description}</p>
              <p>Designed for professional dental use, this high-quality product ensures reliability and excellent clinical outcomes. Manufactured to meet international ISO standards.</p>
            </div>
          )}
          {activeTab === 'specifications' && (
            <div className="tab-pane animate-fade-in-up">
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Material</th>
                    <td>{product.material || 'Standard Clinical Grade'}</td>
                  </tr>
                  <tr>
                    <th>SKU</th>
                    <td>{product.sku || `SKU-${product.id.substring(0,6).toUpperCase()}`}</td>
                  </tr>
                  <tr>
                    <th>Category</th>
                    <td>{product.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="tab-pane animate-fade-in-up">
              <p><strong>Fast Dispatch:</strong> Orders placed before 2 PM are dispatched the same day.</p>
              <p><strong>Standard Delivery:</strong> 3-5 business days.</p>
              <p><strong>Returns:</strong> 30-day return policy for unopened items in original packaging. Sterile items cannot be returned if the seal is broken.</p>
            </div>
          )}
        </div>
      </div>
      </main>
    </>
  );
}
