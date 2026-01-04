const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/apparel-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create a test user for password change testing
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123',
      role: 'admin',
      storeName: 'Test Store'
    });

    await testUser.save();
    console.log('✅ Test user created');
    console.log('Username: testuser');
    console.log('Password: test123');

    // Now test password change
    console.log('\nTesting password change...');

    // Find the test user
    const user = await User.findOne({ username: 'testuser' });

    // Simulate password change process
    const currentPassword = 'test123';
    const newPassword = 'test456';

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    console.log('Current password verification:', isCurrentValid);

    // Change password
    user.password = newPassword;
    await user.save();

    // Verify new password
    const isNewValid = await bcrypt.compare(newPassword, user.password);
    console.log('New password verification:', isNewValid);

    if (isNewValid) {
      console.log('✅ Password change successful!');
      console.log('✅ New credentials:');
      console.log('   Username: testuser');
      console.log('   Password: test456');
    } else {
      console.log('❌ Password change failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUser();
