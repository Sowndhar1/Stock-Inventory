const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  const productCount = await Product.countDocuments();
  const saleCount = await Sale.countDocuments();
  const userCount = await User.countDocuments();
  
  console.log(`\n📊 Database Statistics:`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Sales: ${saleCount}`);
  console.log(`   Users: ${userCount}`);
  
  if (productCount > 0) {
    console.log('\n📦 Sample Products:');
    const products = await Product.find().limit(5);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.sku}) - Qty: ${p.quantity}, Price: ₹${p.price}`);
    });
  }
  
  if (userCount > 0) {
    console.log('\n👥 Users:');
    const users = await User.find();
    users.forEach(u => {
      console.log(`   - ${u.username} (${u.email})`);
    });
  }
  
  mongoose.connection.close();
  console.log('\n✅ Database check complete');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
