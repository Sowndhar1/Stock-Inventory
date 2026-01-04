const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      storePhone: user.storePhone,
      storeEmail: user.storeEmail,
      gstNumber: user.gstNumber,
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update store settings
router.put('/store', auth, async (req, res) => {
  try {
    const { storeName, storeAddress, storePhone, storeEmail, gstNumber, currency, taxRate } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update store fields
    if (storeName) user.storeName = storeName;
    if (storeAddress) user.storeAddress = storeAddress;
    if (storePhone) user.storePhone = storePhone;
    if (storeEmail) user.storeEmail = storeEmail;
    if (gstNumber) user.gstNumber = gstNumber;
    
    // Update settings
    if (currency) user.settings.currency = currency;
    if (taxRate !== undefined) user.settings.taxRate = taxRate;
    
    await user.save();
    
    res.json({ 
      message: 'Store settings updated successfully',
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      storePhone: user.storePhone,
      storeEmail: user.storeEmail,
      gstNumber: user.gstNumber,
      settings: user.settings
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Set new password (let the pre-save hook handle hashing)
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update notification settings
router.put('/notifications', auth, async (req, res) => {
  try {
    const { emailNotifications, lowStockAlerts, salesReports } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (lowStockAlerts !== undefined) user.settings.lowStockAlerts = lowStockAlerts;
    if (salesReports !== undefined) user.settings.salesReports = salesReports;
    
    await user.save();
    
    res.json({ 
      message: 'Notification settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update system settings
router.put('/system', auth, async (req, res) => {
  try {
    const { lowStockThreshold, darkMode, language } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (lowStockThreshold !== undefined) user.settings.lowStockThreshold = lowStockThreshold;
    if (darkMode !== undefined) user.settings.darkMode = darkMode;
    if (language) user.settings.language = language;
    
    await user.save();
    
    res.json({ 
      message: 'System settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
