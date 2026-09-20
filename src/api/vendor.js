import { get, post, put, del } from './client.js';

const STORAGE_KEY = 'snapdent_vendors';

const INITIAL_VENDORS = [
  {
    _id: 'v-101',
    name: 'Dr. Rahul Sharma',
    companyName: 'Apex Dental Instruments',
    email: 'vendor@snapdent.com',
    password: 'vendor123',
    phone: '+91 98765 43210',
    businessCategory: 'Surgical & Restorative Instruments',
    taxId: '27AABCU9603R1ZM',
    businessDescription: 'Premium dental hand instruments, elevators, and extraction forceps with international CE certification.',
    approvalStatus: 'approved',
    isActive: true,
    permissions: ['product:view', 'product:create', 'product:update', 'product:delete', 'inventory:update', 'analytics:view'],
    productCount: 5,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    _id: 'v-102',
    name: 'Priya Mehta',
    companyName: 'BioDent Technologies',
    email: 'biodent@example.com',
    password: 'password123',
    phone: '+91 98111 22334',
    businessCategory: 'Dental Consumables & Materials',
    taxId: '27AABCU1234R1ZZ',
    businessDescription: 'Specialized restorative composites, dual-cure resins, and glass ionomer cements for dental clinics.',
    approvalStatus: 'pending',
    isActive: false,
    permissions: ['product:view', 'product:create', 'product:update'],
    productCount: 0,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'v-103',
    name: 'Anil Kulkarni',
    companyName: 'SmileCraft Ceramics',
    email: 'smilecraft@example.com',
    password: 'password123',
    phone: '+91 98222 55667',
    businessCategory: 'Prosthodontics & CAD/CAM',
    taxId: '',
    businessDescription: 'Zirconia blank milling blocks and ceramic staining kits.',
    approvalStatus: 'rejected',
    rejectionReason: 'Missing business license and quality verification documents.',
    isActive: false,
    permissions: ['product:view'],
    productCount: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function getStoredVendors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
      return INITIAL_VENDORS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_VENDORS;
  }
}

function saveStoredVendors(vendors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

// Public vendor registration
export const registerVendor = async (data) => {
  try {
    return await post('/auth/register-vendor', data);
  } catch (err) {
    const list = getStoredVendors();
    if (list.some(v => v.email?.toLowerCase() === data.email?.toLowerCase())) {
      throw new Error('Email is already registered.');
    }
    const newVendor = {
      _id: 'v-' + Date.now(),
      ...data,
      approvalStatus: 'pending',
      isActive: false,
      permissions: ['product:view', 'product:create', 'product:update'],
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newVendor);
    saveStoredVendors(list);
    return { success: true, message: 'Vendor application submitted successfully', vendor: newVendor };
  }
};

// Admin vendor management
export const getVendors = async (params = '') => {
  try {
    return await get(`/admin/vendors${params ? '?' + params : ''}`);
  } catch (err) {
    const list = getStoredVendors();
    const query = new URLSearchParams(params);
    const search = (query.get('search') || '').toLowerCase();
    const status = query.get('status');

    let filtered = list;
    if (status && status !== 'all') {
      filtered = filtered.filter(v => (v.approvalStatus || 'approved') === status);
    }
    if (search) {
      filtered = filtered.filter(v =>
        v.name?.toLowerCase().includes(search) ||
        v.email?.toLowerCase().includes(search) ||
        v.companyName?.toLowerCase().includes(search)
      );
    }

    const counts = {
      pending: list.filter(v => v.approvalStatus === 'pending').length,
      approved: list.filter(v => (v.approvalStatus || 'approved') === 'approved').length,
      rejected: list.filter(v => v.approvalStatus === 'rejected').length,
      total: list.length,
    };

    return { success: true, vendors: filtered, counts };
  }
};

export const getVendor = async (id) => {
  try {
    return await get(`/admin/vendors/${id}`);
  } catch (err) {
    const list = getStoredVendors();
    const vendor = list.find(v => v._id === id);
    if (!vendor) throw new Error('Vendor not found.');
    return { success: true, vendor, products: [] };
  }
};

export const createVendor = async (data) => {
  try {
    return await post('/admin/vendors', data);
  } catch (err) {
    const list = getStoredVendors();
    const newVendor = {
      _id: 'v-' + Date.now(),
      ...data,
      approvalStatus: 'approved',
      approvedAt: new Date().toISOString(),
      isActive: true,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newVendor);
    saveStoredVendors(list);
    return { success: true, vendor: newVendor };
  }
};

export const updateVendor = async (id, data) => {
  try {
    return await put(`/admin/vendors/${id}`, data);
  } catch (err) {
    const list = getStoredVendors();
    const idx = list.findIndex(v => v._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      saveStoredVendors(list);
      return { success: true, vendor: list[idx] };
    }
    throw new Error('Vendor not found');
  }
};

export const approveVendor = async (id, permissions) => {
  try {
    return await put(`/admin/vendors/${id}/approve`, { permissions });
  } catch (err) {
    const list = getStoredVendors();
    const idx = list.findIndex(v => v._id === id);
    if (idx !== -1) {
      list[idx].approvalStatus = 'approved';
      list[idx].isActive = true;
      list[idx].rejectionReason = '';
      list[idx].approvedAt = new Date().toISOString();
      if (permissions) list[idx].permissions = permissions;
      saveStoredVendors(list);
      return { success: true, vendor: list[idx] };
    }
    throw new Error('Vendor not found');
  }
};

export const rejectVendor = async (id, reason) => {
  try {
    return await put(`/admin/vendors/${id}/reject`, { reason });
  } catch (err) {
    const list = getStoredVendors();
    const idx = list.findIndex(v => v._id === id);
    if (idx !== -1) {
      list[idx].approvalStatus = 'rejected';
      list[idx].isActive = false;
      list[idx].rejectionReason = reason || 'Application did not meet verification criteria.';
      saveStoredVendors(list);
      return { success: true, vendor: list[idx] };
    }
    throw new Error('Vendor not found');
  }
};

export const deleteVendor = async (id) => {
  try {
    return await del(`/admin/vendors/${id}`);
  } catch (err) {
    const list = getStoredVendors().filter(v => v._id !== id);
    saveStoredVendors(list);
    return { success: true, message: 'Vendor removed' };
  }
};

export const updateVendorPermissions = async (id, permissions) => {
  try {
    return await put(`/admin/vendors/${id}/permissions`, { permissions });
  } catch (err) {
    const list = getStoredVendors();
    const idx = list.findIndex(v => v._id === id);
    if (idx !== -1) {
      list[idx].permissions = permissions;
      saveStoredVendors(list);
      return { success: true, vendor: list[idx] };
    }
    throw new Error('Vendor not found');
  }
};

// Vendor product access
export const getMyProducts = (params = '') => get(`/products/my${params ? '?' + params : ''}`);
