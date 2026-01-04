// debug-today-revenue.js
const mongoose = require('mongoose');
require('dotenv').config();

async function debugTodayRevenue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apparel-tracker');
    console.log('🔍 Connected to database');

    const Sale = require('./models/Sale');

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    console.log('📅 Today\'s date range:');
    console.log('Start:', todayStart.toISOString());
    console.log('End:', todayEnd.toISOString());

    const todaySales = await Sale.find({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });

    console.log('💰 Sales found today:', todaySales.length);

    if (todaySales.length > 0) {
      todaySales.forEach((sale, index) => {
        console.log(`${index + 1}. Invoice: ${sale.invoiceNumber}, Total: ₹${sale.total}, Created: ${sale.createdAt}`);
      });

      const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
      console.log('📊 Total revenue (sum): ₹', totalRevenue);

      // Test the aggregation like in dashboard
      const aggregatedRevenue = await Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lt: todayEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);

      console.log('📈 Aggregated revenue:', aggregatedRevenue[0]?.total || 0);
      console.log('✅ Aggregation matches sum:', aggregatedRevenue[0]?.total === totalRevenue);
    } else {
      console.log('❌ No sales found today');
    }

    // Check if there are any sales at all
    const totalSales = await Sale.countDocuments({});
    console.log('📦 Total sales in database:', totalSales);

    if (totalSales > 0) {
      const latestSale = await Sale.findOne({}).sort({ createdAt: -1 });
      console.log('🕐 Latest sale:', latestSale.invoiceNumber, 'at', latestSale.createdAt);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugTodayRevenue();
