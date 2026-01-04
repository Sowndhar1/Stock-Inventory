const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  try {
    // Create new admin user
    const newAdmin = new User({
      username: 'superadmin',
      email: 'superadmin@appareltracker.com',
      password: 'admin123',
      role: 'admin',
      storeName: 'APPAREL STOCK TRACKER - Main Store'
    });
    
    await newAdmin.save();
    
    console.log('✅ New admin user created successfully!\n');
    console.log('Login credentials:');
    console.log('  Username: superadmin');
    console.log('  Password: admin123');
    console.log('  Role: admin');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('❌ User already exists. Use resetAdminPassword.js instead.');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
