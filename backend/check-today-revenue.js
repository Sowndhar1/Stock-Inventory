// check-today-revenue.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkTodayRevenue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apparel-tracker');
    console.log('🔍 Connected to database');

    const Sale = require('./models/Sale');

    // Get current date boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    console.log('📅 Today\'s date range:');
    console.log('Start:', todayStart.toISOString());
    console.log('End:', todayEnd.toISOString());

    // Check for sales today
    const todaySales = await Sale.find({
      createdAt: {
        $gte: todayStart,
        $lt: todayEnd
      }
    });

    console.log('💰 Sales today:', todaySales.length);

    if (todaySales.length > 0) {
      todaySales.forEach((sale, index) => {
        console.log(`${index + 1}. Invoice: ${sale.invoiceNumber}, Total: ₹${sale.total}, Date: ${sale.createdAt}`);
      });

      // Calculate total revenue
      const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
      console.log('📊 Total revenue today: ₹', totalRevenue);
    } else {
      console.log('❌ No sales found today');
    }

    // Check for recent sales (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const recentSales = await Sale.find({
      createdAt: { $gte: weekStart }
    }).sort({ createdAt: -1 }).limit(5);

    console.log('\n📋 Recent sales (last 7 days):');
    recentSales.forEach((sale, index) => {
      console.log(`${index + 1}. Invoice: ${sale.invoiceNumber}, Total: ₹${sale.total}, Date: ${sale.createdAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTodayRevenue();
