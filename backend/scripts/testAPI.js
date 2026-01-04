const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  // Get a user and generate a token
  const user = await User.findOne({ username: 'admin' });
  
  if (!user) {
    console.log('❌ No admin user found. Please create one first.');
    mongoose.connection.close();
    return;
  }
  
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: '24h' }
  );
  
  console.log('🔑 Test Token for user "admin":');
  console.log(token);
  console.log('\n📋 Test this in your browser console:');
  console.log(`
fetch('/api/products?limit=1000', {
  headers: { 
    'Authorization': 'Bearer ${token}'
  }
})
.then(res => res.json())
.then(data => console.log('Products:', data))
.catch(err => console.error('Error:', err));
  `);
  
  console.log('\n💡 Or test with curl:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/products?limit=1000`);
  
  mongoose.connection.close();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
