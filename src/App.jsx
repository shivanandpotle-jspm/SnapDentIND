import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyOrders from './pages/MyOrders';
import Shipping from './pages/Shipping';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import PrivacyPolicy from './pages/PrivacyPage';
import TermsOfService from './pages/TermsPage';
import ShippingPolicy from './pages/ShippingPolicyPage';
import RefundPolicy from './pages/RefundPolicyPage';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminInventory from './admin/AdminInventory';
import AdminDiscounts from './admin/AdminDiscounts';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminMessages from './admin/AdminMessages';
import AdminCategories from './admin/AdminCategories';
import AdminSettings from './admin/AdminSettings';
import AdminProfile from './admin/AdminProfile';
import AdminVendors from './admin/AdminVendors';

import VendorLogin from './vendor/VendorLogin';
import VendorRegister from './vendor/VendorRegister';
import VendorLayout from './vendor/VendorLayout';
import VendorDashboard from './vendor/VendorDashboard';
import VendorProducts from './vendor/VendorProducts';
import VendorProductForm from './vendor/VendorProductForm';
import VendorProfile from './vendor/VendorProfile';

function AppContent() {
  const location = useLocation();
  const isPanel = location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor');

  return (
    <>
      <ScrollToTop />
      {!isPanel && <Navbar />}
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<MyOrders />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/shipping-info" element={<ShippingPolicy />} />
        <Route path="/cancellation-refund-policy" element={<RefundPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/returns" element={<RefundPolicy />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/register" element={<VendorRegister />} />
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/add" element={<VendorProductForm />} />
          <Route path="products/edit/:id" element={<VendorProductForm />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>
      </Routes>
      {!isPanel && <Footer />}
      {!isPanel && <BackToTop />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
