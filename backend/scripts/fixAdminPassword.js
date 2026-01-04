const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');

  try {
    // Find admin user
    const admin = await User.findOne({ username: 'admin' });

    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('\n🔧 Creating new admin user...');

      // Create new admin user
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@appareltracker.com',
        password: 'admin123',
        role: 'admin',
        storeName: 'APPAREL STOCK TRACKER'
      });

      await newAdmin.save();

      console.log('✅ New admin user created!');
      console.log('\nLogin credentials:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  Role: admin');

    } else {
      console.log('✅ Found existing admin user');
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);

      // Reset password to admin123
      admin.password = 'admin123';
      await admin.save();

      console.log('\n✅ Password has been reset to: admin123');
      console.log('\nYou can now login with:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
