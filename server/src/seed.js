import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';

// ─── Categories (from frontend data) ────────────────────────
const categories = [
  {
    name: 'Implant Surgical Accessories',
    icon: 'medical_services',
    description: 'Kits, drills, stops, gauges & surgical tools for implantology',
    color: '#E31E24',
    items: ['Implant surgical kits', 'Implant drills', 'Drill extensions', 'Drill stops', 'Depth gauges', 'Parallel pins', 'Implant carriers', 'Implant drivers', 'Torque wrenches', 'Ratchets', 'Surgical trays', 'Irrigation tubing'],
  },
  {
    name: 'Dental Equipment',
    icon: 'chair',
    description: 'Chairs, units, operating lights, suction & operator stools',
    color: '#1A3673',
    items: ['Dental chairs', 'Dental units', 'Operating lights', 'Compressors', 'Suction systems', 'Stools'],
  },
  {
    name: 'Dental Instruments',
    icon: 'handyman',
    description: 'Diagnostic, surgical, extraction & periodontal instruments',
    color: '#0D9488',
    items: ['Diagnostic instruments', 'Surgical instruments', 'Extraction instruments', 'Periodontal instruments', 'Endodontic instruments'],
  },
  {
    name: 'Implantology',
    icon: 'biotech',
    description: 'Abutments, healing caps, prosthetic components & implants',
    color: '#7C3AED',
    items: ['Implant components', 'Implant instruments', 'Implant drills', 'Surgical kits', 'Healing abutments', 'Prosthetic components'],
  },
  {
    name: 'Endodontics',
    icon: 'health_and_safety',
    description: 'Files, endo motors, apex locators, gutta-percha & sealers',
    color: '#EA580C',
    items: ['K-files', 'H-files', 'Rotary files', 'Endo motors', 'Apex locators', 'Gutta-percha', 'Sealers'],
  },
  {
    name: 'Restorative Dentistry',
    icon: 'dentistry',
    description: 'Composites, GIC, bonding, matrices & polishing systems',
    color: '#2563EB',
    items: ['Composites', 'GIC', 'Bonding agents', 'Etchants', 'Liners', 'Matrices', 'Wedges', 'Finishing & polishing'],
  },
];

// ─── Products (from frontend data) ──────────────────────────
const products = [
  { name: 'Pro Torque Wrench 15-45 Ncm', category: 'Implant Surgical Accessories', subcategory: 'Torque wrenches', price: 450.00, description: 'Ergonomic stainless steel torque wrench with precise preset friction control.', image: 'http://localhost:5000/uploads/prod_drill.jpg', badge: 'Popular', material: 'Stainless Steel', stock: 50 },
  { name: 'Surgical Drill Kit Complete', category: 'Implant Surgical Accessories', subcategory: 'Implant surgical kits', price: 1250.00, description: 'Complete osteotomy kit including initial, final, and countersink drills in autoclavable tray.', image: 'http://localhost:5000/uploads/prod_drill.jpg', badge: 'Bestseller', material: 'Titanium Coated', stock: 30 },
  { name: 'Surgical Drill Extension Tool', category: 'Implant Surgical Accessories', subcategory: 'Drill extensions', price: 65.00, description: 'High durability extension latch shaft for restricted interdental spaces.', image: 'http://localhost:5000/uploads/prod_drill.jpg', badge: '', material: 'Stainless Steel', stock: 100 },
  { name: 'Stopper Drill Kit (Set of 6)', category: 'Implant Surgical Accessories', subcategory: 'Drill stops', price: 180.00, description: 'Color-coded depth stop sleeves for precise osteotomy depth control.', image: 'http://localhost:5000/uploads/prod_drill.jpg', badge: 'New', material: 'Titanium Alloy', stock: 75 },
  { name: 'Laser Depth Gauge Meter', category: 'Implant Surgical Accessories', subcategory: 'Depth gauges', price: 48.00, description: 'Double-ended laser etched osteotomy measurement gauge.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: '', material: 'Stainless Steel', stock: 120 },
  { name: 'Parallel Alignment Pins (Pack of 4)', category: 'Implant Surgical Accessories', subcategory: 'Parallel pins', price: 55.00, description: 'Dual diameter parallel pins for verifying osteotomy trajectory.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: '', material: 'Stainless Steel', stock: 90 },
  { name: 'Titanium Implant Driver Latch', category: 'Implant Surgical Accessories', subcategory: 'Implant drivers', price: 75.00, description: 'Direct hex driver shaft for latch-type contra angle handpieces.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: '', material: 'Titanium', stock: 60 },
  { name: 'Autoclavable Surgical Organiser Tray', category: 'Implant Surgical Accessories', subcategory: 'Surgical trays', price: 220.00, description: 'High-temperature resistant silicone grommet organizer tray.', image: 'http://localhost:5000/uploads/prod_tray.jpg', badge: '', material: 'PPSU Resin', stock: 40 },
  { name: 'Operating Light LED Unit', category: 'Dental Equipment', subcategory: 'Operating lights', price: 950.00, description: 'High-intensity shadowless LED illumination with dual color temperature.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: 'New', material: 'Aluminum & Optics', stock: 20 },
  { name: 'Ergonomic Doctor Stool', category: 'Dental Equipment', subcategory: 'Stools', price: 380.00, description: '3D adjustable armrest and lumbar support stool for clinical ergonomics.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: 'Bestseller', material: 'Microfiber Leather', stock: 35 },
  { name: 'Silent Oil-Free Dental Compressor', category: 'Dental Equipment', subcategory: 'Compressors', price: 1450.00, description: 'Ultra-quiet 2HP medical grade oil-free air compressor with dryer.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: 'Premium', material: 'Steel & Alloy', stock: 15 },
  { name: 'High Vacuum Suction Unit', category: 'Dental Equipment', subcategory: 'Suction systems', price: 890.00, description: 'Continuous duty high volume evacuation system for surgery operatories.', image: 'http://localhost:5000/uploads/prod_equipment.jpg', badge: '', material: 'Medical Polymer', stock: 25 },
  { name: 'Precision Periodontal Probe UNC-15', category: 'Dental Instruments', subcategory: 'Periodontal instruments', price: 42.00, description: 'Laser marked pocket measuring probe with satin non-glare handle.', image: 'http://localhost:5000/uploads/prod_instrument.jpg', badge: '', material: 'Stainless Steel', stock: 200 },
  { name: 'Atraumatic Extraction Forceps Set', category: 'Dental Instruments', subcategory: 'Extraction instruments', price: 310.00, description: 'Set of 6 anatomical beak extraction forceps with diamond coating.', image: 'http://localhost:5000/uploads/prod_instrument.jpg', badge: 'Popular', material: 'German Stainless', stock: 45 },
  { name: 'Diagnostic Explorer & Mirror Kit', category: 'Dental Instruments', subcategory: 'Diagnostic instruments', price: 58.00, description: 'Front surface rhodium mirror with hollow ergonomic explorer.', image: 'http://localhost:5000/uploads/prod_instrument.jpg', badge: '', material: 'Rhodium Coating', stock: 150 },
  { name: 'Neo Ti-Base Abutment (Korean Compatible)', category: 'Implantology', subcategory: 'Prosthetic components', price: 125.00, description: 'Precision engineered titanium base for reliable digital restorations.', image: 'http://localhost:5000/uploads/prod_abutment.jpg', badge: 'Top Rated', material: 'Grade 5 Titanium', stock: 80 },
  { name: 'Anatomic Healing Abutment', category: 'Implantology', subcategory: 'Healing abutments', price: 85.00, description: 'Contoured emergence profile cap for soft tissue preservation.', image: 'http://localhost:5000/uploads/prod_abutment.jpg', badge: '', material: 'Titanium', stock: 70 },
  { name: 'Multi-Unit Abutment 17° Angled', category: 'Implantology', subcategory: 'Implant components', price: 210.00, description: 'Angled multi-unit prosthetic foundation for full arch restorations.', image: 'http://localhost:5000/uploads/prod_abutment.jpg', badge: 'Bestseller', material: 'Titanium Alloy', stock: 55 },
  { name: 'NiTi Rotary File System (Pack of 6)', category: 'Endodontics', subcategory: 'Rotary files', price: 78.00, description: 'Heat-treated gold NiTi rotary files with high cyclic fatigue resistance.', image: 'http://localhost:5000/uploads/prod_files.jpg', badge: 'Popular', material: 'Gold NiTi', stock: 100 },
  { name: 'K-Files Hand Set 25mm (#15-40)', category: 'Endodontics', subcategory: 'K-files', price: 35.00, description: 'High flexibility stainless steel root canal hand files.', image: 'http://localhost:5000/uploads/prod_files.jpg', badge: '', material: 'Stainless Steel', stock: 250 },
  { name: 'Smart Endo Motor with Apex Locator', category: 'Endodontics', subcategory: 'Endo motors', price: 680.00, description: 'Wireless brushless endodontic motor with integrated real-time apex locator.', image: 'http://localhost:5000/uploads/prod_endo.jpg', badge: 'New', material: 'Digital Electronics', stock: 20 },
  { name: 'Nano-Hybrid Composite Syringe Kit', category: 'Restorative Dentistry', subcategory: 'Composites', price: 145.00, description: 'Universal light-cure aesthetic composite with high chameleon effect.', image: 'http://localhost:5000/uploads/prod_composite.jpg', badge: 'Bestseller', material: 'Nano Resin', stock: 85 },
  { name: 'Glass Ionomer Cement (GIC Type IX)', category: 'Restorative Dentistry', subcategory: 'GIC', price: 62.00, description: 'High strength packable glass ionomer restorative material.', image: 'http://localhost:5000/uploads/prod_gic.jpg', badge: '', material: 'Glass Ionomer', stock: 110 },
  { name: 'Universal Dental Bonding Agent 5ml', category: 'Restorative Dentistry', subcategory: 'Bonding agents', price: 52.00, description: 'Single component 8th generation universal adhesive for direct/indirect cases.', image: 'http://localhost:5000/uploads/prod_bonding.jpg', badge: '', material: 'Adhesive Resin', stock: 130 },
];

// ─── Demo Orders ─────────────────────────────────────────────
const demoOrders = [
  { orderId: 'SD-10000042', customer: 'Dr. Anil Sharma', total: 2150, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'card' },
  { orderId: 'SD-10000041', customer: 'Dr. Priya Desai', total: 165, status: 'processing', paymentStatus: 'paid', paymentMethod: 'upi' },
  { orderId: 'SD-10000040', customer: 'HealthDent Clinic', total: 1630, status: 'shipped', paymentStatus: 'paid', paymentMethod: 'netbanking' },
  { orderId: 'SD-10000039', customer: 'Dr. Rahul Verma', total: 325, status: 'pending', paymentStatus: 'pending', paymentMethod: 'cod' },
  { orderId: 'SD-10000038', customer: 'SmileCare Hospital', total: 580, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'card' },
  { orderId: 'SD-10000037', customer: 'Dr. Kavita Nair', total: 680, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'card' },
  { orderId: 'SD-10000036', customer: 'City Dental Lab', total: 580, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'upi' },
];

// ─── Seed Function ───────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Seeding SnapDent database...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('  ✓ Cleared existing data');

    // Seed admin user
    const admin = await User.create({
      name: 'SnapDent Admin',
      email: 'admin@snapdent.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });
    console.log('  ✓ Admin user created (admin@snapdent.com / admin123)');

    // Seed demo customer
    const customer = await User.create({
      name: 'Dr. Anil Sharma',
      email: 'customer@demo.com',
      password: 'customer123',
      role: 'customer',
      isVerified: true,
      phone: '+91 98765 43210',
      addresses: [{
        firstName: 'Anil',
        lastName: 'Sharma',
        street: '42 MG Road, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400058',
        phone: '+91 98765 43210',
        isDefault: true,
      }],
    });
    console.log('  ✓ Demo customer created (customer@demo.com / customer123)');

    // Seed categories
    const createdCategories = [];
    for (const cat of categories) {
      createdCategories.push(await Category.create(cat));
    }
    console.log(`  ✓ ${createdCategories.length} categories seeded`);

    // Seed products
    const productDocs = products.map(p => ({
      ...p,
      images: [{ url: p.image, driveFileId: '' }],
      inStock: true,
      isVisible: true,
      isFeatured: !!p.badge,
    }));
    productDocs.forEach(p => delete p.image);
    
    const createdProducts = [];
    for (const p of productDocs) {
      createdProducts.push(await Product.create(p));
    }
    console.log(`  ✓ ${createdProducts.length} products seeded`);

    // Seed demo orders
    const orderDocs = demoOrders.map((o, i) => ({
      orderId: o.orderId,
      user: customer._id,
      items: [
        {
          product: createdProducts[i % createdProducts.length]._id,
          name: createdProducts[i % createdProducts.length].name,
          price: createdProducts[i % createdProducts.length].price,
          qty: Math.floor(Math.random() * 3) + 1,
          image: createdProducts[i % createdProducts.length].images[0]?.url || '',
        },
      ],
      shippingAddress: {
        firstName: o.customer.split(' ')[0] || 'Dr.',
        lastName: o.customer.split(' ').slice(1).join(' ') || 'Customer',
        street: '42 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400058',
        phone: '+91 98765 43210',
      },
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      subtotal: o.total,
      shipping: 0,
      tax: 0,
      total: o.total,
      status: o.status,
      statusHistory: [{ status: o.status, note: 'Seeded demo order' }],
    }));
    
    for (const o of orderDocs) {
      await Order.create(o);
    }
    console.log(`  ✓ ${orderDocs.length} demo orders seeded`);

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
