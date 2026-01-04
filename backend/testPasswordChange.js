const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testPasswordChange() {
  try {
    await mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('Testing password change process...');

    // Test current password verification
    const currentPassword = 'admin123';
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
    console.log('Current password valid:', isCurrentValid);

    // Test new password hashing
    const newPassword = 'admin1234';
    console.log('New password length:', newPassword.length);

    // Simulate the password change process
    admin.password = newPassword;
    await admin.save();

    // Verify the new password works
    const updatedAdmin = await User.findOne({ username: 'admin' });
    const isNewValid = await bcrypt.compare(newPassword, updatedAdmin.password);

    console.log('New password valid after save:', isNewValid);

    if (isNewValid) {
      console.log('✅ Password change process works correctly!');
      console.log('✅ New password is:', newPassword);
    } else {
      console.log('❌ Password change failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testPasswordChange();
