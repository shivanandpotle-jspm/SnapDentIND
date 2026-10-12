import { heroImages } from '../data/products';
import './About.css';

export default function About() {
  const stats = [
    { value: '10+', label: 'Years of Excellence' },
    { value: '500+', label: 'Partner Clinics' },
    { value: '50K+', label: 'Products Delivered' },
    { value: '99%', label: 'Satisfaction Rate' },
  ];

  return (
    <main className="about-page animate-fade-in-up">
      {/* Hero */}
      <section className="about-hero section-gap container-max">
        <div className="about-hero-grid">
          <div className="about-hero-content">
            <span className="about-label">About Snapdent India</span>
            <h1 className="about-hero-title">Redefining <span className="hero__accent">Dental</span> Excellence</h1>
            <p className="about-hero-desc">
              We are dedicated to empowering dental professionals with precision-engineered components and cutting-edge technology. Our commitment to quality has made us a trusted partner for clinics across India.
            </p>
          </div>
          <div className="about-hero-image">
            <img src={heroImages.about} alt="About Snapdent India" />
            <div className="about-hero-glow" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats container-max">
        <div className="about-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="about-stat-item">
              <span className="about-stat-value">{s.value}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="about-story section-gap container-max">
        <div className="about-story-grid">
          <div className="about-story-visual">
            <img src={heroImages.aboutDetail} alt="Our Story" />
          </div>
          <div className="about-story-content">
            <span className="about-label">Our Story</span>
            <h2 className="about-section-title">From Passion to <span className="hero__accent">Precision</span></h2>
            <p>
              Founded with a vision to revolutionize dental care in India, Snapdent India began as a small team of engineers and dental professionals who shared a common goal: to make world-class dental components accessible to every practitioner.
            </p>
            <p>
              Today, we serve over 500 partner clinics nationwide, providing precision-engineered implant prosthetics, digital components, and surgical tools that meet the highest international standards.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values section-gap">
        <div className="container-max">
          <h2 className="about-section-title" style={{ textAlign: 'center', color: 'var(--primary)' }}>Our Core Values</h2>
          <div className="about-values-grid">
            {[
              { icon: 'precision_manufacturing', title: 'Precision Engineering', desc: 'Every component is manufactured to exacting tolerances, ensuring reliable clinical outcomes for dental professionals.' },
              { icon: 'science', title: 'Innovation First', desc: 'We continuously invest in R&D to develop cutting-edge dental solutions that push the boundaries of what\'s possible.' },
              { icon: 'diversity_3', title: 'Professional Partnership', desc: 'We work alongside dental professionals as true partners, providing expert support and training for optimal results.' },
              { icon: 'verified', title: 'Quality Assurance', desc: 'Our rigorous quality control processes guarantee that every product meets international standards of excellence.' },
            ].map(v => (
              <div key={v.title} className="about-value-card card">
                <div className="about-value-icon">
                  <span className="material-symbols-outlined">{v.icon}</span>
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
