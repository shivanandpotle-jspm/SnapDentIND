import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  tag: {
    type: String,
    default: 'FEATURED INNOVATION',
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Banner description is required'],
    trim: true,
  },
  buttonText: {
    type: String,
    default: 'DISCOVER MORE',
    trim: true,
  },
  link: {
    type: String,
    default: '/shop',
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Banner image is required'],
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active',
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Transform output for frontend
bannerSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Banner', bannerSchema);
