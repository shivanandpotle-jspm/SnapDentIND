import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    default: 'All',
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled', 'Expired'],
    default: 'Active',
  },
  showOnHome: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Transform output for frontend
discountSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    // Format dates as YYYY-MM-DD for frontend compatibility
    ret.startDate = ret.startDate ? new Date(ret.startDate).toISOString().split('T')[0] : null;
    ret.endDate = ret.endDate ? new Date(ret.endDate).toISOString().split('T')[0] : null;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Discount', discountSchema);
