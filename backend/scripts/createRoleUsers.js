const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  const users = [
    {
      username: 'admin',
      email: 'admin@appareltracker.com',
      password: 'admin123',
      role: 'admin',
      storeName: 'APPAREL STOCK TRACKER - Main Store'
    },
    {
      username: 'sales_staff',
      email: 'sales@appareltracker.com',
      password: 'sales123',
      role: 'sales',
      storeName: 'APPAREL STOCK TRACKER - Sales Desk'
    },
    {
      username: 'inventory_staff',
      email: 'inventory@appareltracker.com',
      password: 'inventory123',
      role: 'inventory',
      storeName: 'APPAREL STOCK TRACKER - Warehouse'
    }
  ];
  
  console.log('👥 Creating/Updating users with roles:\n');
  
  for (const userData of users) {
    try {
      // Check if user exists
      let user = await User.findOne({ username: userData.username });
      
      if (user) {
        // Update existing user's role
        user.role = userData.role;
        user.email = userData.email;
        user.storeName = userData.storeName;
        await user.save();
        console.log(`✅ Updated: ${userData.username} - Role: ${userData.role}`);
      } else {
        // Create new user
        user = new User(userData);
        await user.save();
        console.log(`✅ Created: ${userData.username} - Role: ${userData.role}`);
      }
    } catch (error) {
      console.log(`❌ Error with ${userData.username}:`, error.message);
    }
  }
  
  console.log('\n📋 Login Credentials:\n');
  console.log('Admin User:');
  console.log('  Username: admin');
  console.log('  Password: admin123');
  console.log('  Role: admin (Full access)\n');
  
  console.log('Sales Staff:');
  console.log('  Username: sales_staff');
  console.log('  Password: sales123');
  console.log('  Role: sales (Can create sales, view products)\n');
  
  console.log('Inventory Staff:');
  console.log('  Username: inventory_staff');
  console.log('  Password: inventory123');
  console.log('  Role: inventory (Can manage products, view inventory)\n');
  
  mongoose.connection.close();
  console.log('✅ Setup complete!');
})
.catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
