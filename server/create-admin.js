import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/snapdent';

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const admin = await db.collection('users').findOne({ email: 'admin@snapdent.com' });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);
    await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@snapdent.com',
      password: password,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created admin@snapdent.com / admin123');
  } else {
    console.log('Admin already exists');
  }
  process.exit(0);
});
