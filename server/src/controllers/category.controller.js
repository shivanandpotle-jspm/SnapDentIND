import Category from '../models/Category.js';

const defaultSeedCategories = [
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

export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ name: 1 });
    if (categories.length === 0) {
      categories = await Category.insertMany(defaultSeedCategories);
    }
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
