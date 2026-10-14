import { Link } from 'react-router-dom';
import { logos } from '../data/products';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container-max">
        <div className="footer__brand">
          <Link to="/">
            <img
              src={logos.footer}
              alt="Snapdent India"
              className="footer__logo"
            />
          </Link>
          <p className="footer__copy">
            © 2024 Snapdent India. Advanced clinical solutions.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__link-group">
            <h4 className="footer__link-title">Company</h4>
            <Link to="/about" className="footer__link">About Us</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
            <Link to="/shop" className="footer__link">Shop</Link>
          </div>
          <div className="footer__link-group">
            <h4 className="footer__link-title">Support</h4>
            <Link to="/shipping-policy" className="footer__link">Shipping & Delivery</Link>
            <Link to="/cancellation-refund-policy" className="footer__link">Cancellation & Refunds</Link>
            <Link to="/contact" className="footer__link">Help Center</Link>
          </div>
          <div className="footer__link-group">
            <h4 className="footer__link-title">Legal</h4>
            <Link to="/privacy-policy" className="footer__link">Privacy Policy</Link>
            <Link to="/terms-of-service" className="footer__link">Terms & Conditions</Link>
            <Link to="/cancellation-refund-policy" className="footer__link">Refund Policy</Link>
          </div>
          <div className="footer__link-group">
            <h4 className="footer__link-title">Portals</h4>
            <Link to="/vendor/login" className="footer__link">Vendor Portal</Link>
            <Link to="/admin/login" className="footer__link">Admin Panel</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom container-max">
        <p className="footer__bottom-text">
          Precision engineered dental components for clinical professionals worldwide.
        </p>
      </div>
    </footer>
  );
}
