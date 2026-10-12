import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store';
import './Home.css';

export default function Home() {
  const store = useStore();
  const { products, heroImages, categoryImages, testimonials } = store;
  const featured = products.slice(0, 2);

  return (
    <>
      <main className="animate-fade-in-up">
      {/* Hero */}
      <section className="hero section-gap container-max">
        <div className="hero__grid">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              <span>New Standards in Dentistry</span>
            </div>
            <h1 className="hero__title">
              Precision <span className="hero__accent">Engineered,</span><br />
              Clinical <span className="hero__accent-secondary">Joy.</span>
            </h1>
            <p className="hero__subtitle">
              Advanced clinical care solutions designed for professionals who demand superior accuracy and predictable outcomes. Experience the reliability of modern implantology.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn-primary animate-pulse-cta">Shop Collection</Link>
              <Link to="/shop" className="btn btn-secondary">View Treatments</Link>
            </div>
            <div className="hero__trust">
              <div className="hero__avatars">
                <div className="hero__avatar" style={{ background: 'var(--secondary-container)' }}>DR</div>
                <div className="hero__avatar" style={{ background: 'var(--primary-container)' }}>MC</div>
                <div className="hero__avatar" style={{ background: 'var(--tertiary-container)' }}>EP</div>
              </div>
              <p className="hero__trust-text">Trusted by <strong style={{ color: 'var(--primary)' }}>500+</strong> clinics nationwide</p>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__glow" />
            <div className="hero__main-image animate-float">
              <img src={heroImages.main} alt="Premium Dental Solutions" />
            </div>
            <div className="hero__stat">
              <div className="hero__stat-number">&gt;50k</div>
              <div className="hero__stat-label">Satisfied Dentists</div>
            </div>
            <div className="hero__secondary-image animate-float-delayed">
              <img src={heroImages.detail} alt="Clinical Detail" />
              <div className="hero__secondary-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* Offers & Promos */}
      <section className="section-gap container-max">
        <h2 className="section-title" style={{ color: 'var(--primary)', textAlign: 'center' }}>Special Offers & Promos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {store.discounts.filter(d => d.status === 'Active' && d.showOnHome).map(discount => (
            <div key={discount.id} className="card-elevated animate-fade-in-up" style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface-container-low)', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '6px 16px', borderBottomLeftRadius: '12px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {discount.type === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
              </div>
              <h3 style={{ fontSize: '20px', color: 'var(--on-surface)', marginTop: '8px' }}>{discount.name}</h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                {discount.category !== 'All' ? `Applicable on ${discount.category} products.` : 'Applicable on all products across the store.'}
                <br />
                Valid until {new Date(discount.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.
              </p>
              <div style={{ background: 'var(--primary-container)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '18px', color: 'var(--on-primary-container)', letterSpacing: '1px' }}>{discount.code}</span>
                <button 
                  onClick={(e) => {
                    navigator.clipboard.writeText(discount.code);
                    e.target.innerText = 'COPIED!';
                    setTimeout(() => e.target.innerText = 'COPY', 2000);
                  }}
                  style={{ background: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 700, color: 'var(--primary)', transition: '0.2s ease' }}
                >
                  COPY
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Innovation */}
      <section className="section-gap container-max">
        <div className="featured-section">
          <div className="featured-content">
            <span className="featured-label">Featured Innovation</span>
            <h3 className="featured-title">Anatomic Healing Abutment</h3>
            <p className="featured-desc">Create a natural gum contour, support inter-dental papilla formation, and improve aesthetic outcomes with our precision-engineered anatomic healing abutments.</p>
            <Link to="/shop" className="btn btn-primary">DISCOVER MORE</Link>
          </div>
          <div className="featured-visual">
            <img src={heroImages.featured} alt="Anatomic Healing Abutment" className="animate-float" />
            <div className="featured-glow" />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="products-section section-gap">
        <div className="container-max">
          <div className="products-header">
            <h2 className="section-title" style={{ color: 'var(--primary)', maxWidth: 480 }}>
              Every detail engineered to ensure predictable clinical outcomes.
            </h2>
            <Link to="/shop" className="products-view-all">
              VIEW ALL PRODUCTS <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="home-products-grid">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-gap container-max">
        <h2 className="section-title" style={{ textAlign: 'center', color: 'var(--primary)' }}>Trusted by Professionals</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`testimonial-card ${t.featured ? 'testimonial-card--featured' : ''}`}
            >
              <span className="material-symbols-outlined testimonial-quote">format_quote</span>
              <div className="testimonial-header">
                <div className="testimonial-avatar" data-color={t.color}>{t.initials}</div>
                <div>
                  <h4 className="testimonial-name">{t.name}</h4>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
              <p className="testimonial-text">{t.quote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="section-gap container-max">
        <div className="trust-grid">
          <div className="trust-item" style={{ background: 'var(--secondary-fixed-dim, #a9c7ff)' }}>
            <span className="material-symbols-outlined trust-icon">precision_manufacturing</span>
            <h4>High Precision</h4>
            <p>Manufactured to exact tolerances.</p>
          </div>
          <div className="trust-item trust-item--large">
            <img src={heroImages.trust} alt="Trusted by Specialists" loading="lazy" />
            <div className="trust-item-overlay">
              <h3>Trusted by Specialists</h3>
              <p>Advanced clinical performance for uncompromising professionals.</p>
            </div>
          </div>
          <div className="trust-item" style={{ background: 'var(--tertiary-container)' }}>
            <span className="material-symbols-outlined trust-icon">verified_user</span>
            <h4>Quality Assured</h4>
            <p>Rigorous quality control standards.</p>
          </div>
          <div className="trust-item" style={{ background: 'var(--surface-container-high)' }}>
            <span className="material-symbols-outlined trust-icon" style={{ color: 'var(--primary)' }}>medical_services</span>
            <h4 style={{ color: 'var(--primary)' }}>Clinically Proven</h4>
            <p>Backed by extensive research.</p>
          </div>
          <div className="trust-item" style={{ background: 'var(--primary-container)' }}>
            <span className="material-symbols-outlined trust-icon">all_inclusive</span>
            <h4>Broad Compatibility</h4>
            <p>Seamless integration across systems.</p>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
