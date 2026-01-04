const mongoose = require('mongoose');
const User = require('./models/User');

async function fixPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });

    if (admin) {
      console.log('Found admin user:', admin.username);
      console.log('Current email:', admin.email);

      // Reset password to admin123
      admin.password = 'admin123';
      await admin.save();

      console.log('✅ Admin password reset to: admin123');
      console.log('\nYou can now login with:');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

fixPassword();
