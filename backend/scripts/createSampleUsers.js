const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apparel-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleUsers = async () => {
  try {
    console.log('🔄 Creating sample users...');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@apparel-tracker.com',
      password: 'admin123',
      role: 'admin',
      storeName: 'APPAREL STOCK TRACKER - Admin',
      storeAddress: '123 Admin Street, Tech City',
      storePhone: '+91 98765 43210',
      storeEmail: 'admin@apparel-tracker.com',
      gstNumber: '22ADMIN0000A1Z5'
    });

    // Create sound user
    const soundUser = new User({
      username: 'sound',
      email: 'sound@fashionstore.com',
      password: 'Sound@123',
      role: 'admin',
      storeName: 'Sound Fashion Store',
      storeAddress: '456 Fashion Avenue, Style City',
      storePhone: '+91 98765 12345',
      storeEmail: 'sound@fashionstore.com',
      gstNumber: '22SOUND0000A1Z5'
    });

    // Create another sample user
    const fashionUser = new User({
      username: 'fashion',
      email: 'fashion@boutique.com',
      password: 'Fashion@123',
      role: 'admin',
      storeName: 'Fashion Boutique',
      storeAddress: '789 Trend Street, Fashion District',
      storePhone: '+91 98765 67890',
      storeEmail: 'fashion@boutique.com',
      gstNumber: '22FASHION0000A1Z5'
    });

    // Save users
    await adminUser.save();
    await soundUser.save();
    await fashionUser.save();

    console.log('✅ Sample users created successfully!');

    // Create sample products for sound user
    const soundProducts = [
      {
        name: 'Classic White T-Shirt',
        sku: 'SOUND-TSH-001',
        brand: 'Sound Brand',
        category: 'T-Shirts',
        size: 'M',
        color: 'White',
        quantity: 50,
        price: 599,
        costPrice: 300,
        description: 'Premium cotton classic white t-shirt',
        reorderPoint: 10,
        reorderQuantity: 20,
        supplier: {
          name: 'Sound Suppliers',
          contact: '+91 98765 11111',
          email: 'supplier@sound.com'
        }
      },
      {
        name: 'Denim Jeans',
        sku: 'SOUND-JEAN-001',
        brand: 'Sound Denim',
        category: 'Jeans',
        size: 'L',
        color: 'Blue',
        quantity: 30,
        price: 1299,
        costPrice: 800,
        description: 'Comfortable denim jeans',
        reorderPoint: 5,
        reorderQuantity: 15,
        supplier: {
          name: 'Denim Suppliers',
          contact: '+91 98765 22222',
          email: 'denim@suppliers.com'
        }
      },
      {
        name: 'Casual Shirt',
        sku: 'SOUND-SHRT-001',
        brand: 'Sound Casual',
        category: 'Shirts',
        size: 'XL',
        color: 'Black',
        quantity: 25,
        price: 899,
        costPrice: 500,
        description: 'Stylish casual shirt',
        reorderPoint: 8,
        reorderQuantity: 12,
        supplier: {
          name: 'Casual Wear Suppliers',
          contact: '+91 98765 33333',
          email: 'casual@suppliers.com'
        }
      },
      {
        name: 'Summer Dress',
        sku: 'SOUND-DRS-001',
        brand: 'Sound Fashion',
        category: 'Dresses',
        size: 'M',
        color: 'Pink',
        quantity: 15,
        price: 1499,
        costPrice: 900,
        description: 'Beautiful summer dress',
        reorderPoint: 3,
        reorderQuantity: 10,
        supplier: {
          name: 'Dress Suppliers',
          contact: '+91 98765 44444',
          email: 'dress@suppliers.com'
        }
      },
      {
        name: 'Sports Jacket',
        sku: 'SOUND-JKT-001',
        brand: 'Sound Sports',
        category: 'Jackets',
        size: 'L',
        color: 'Red',
        quantity: 20,
        price: 1999,
        costPrice: 1200,
        description: 'Comfortable sports jacket',
        reorderPoint: 5,
        reorderQuantity: 8,
        supplier: {
          name: 'Sports Suppliers',
          contact: '+91 98765 55555',
          email: 'sports@suppliers.com'
        }
      }
    ];

    // Create sample products for fashion user
    const fashionProducts = [
      {
        name: 'Premium Cotton Shirt',
        sku: 'FASH-SHRT-001',
        brand: 'Fashion Premium',
        category: 'Shirts',
        size: 'M',
        color: 'White',
        quantity: 40,
        price: 1199,
        costPrice: 700,
        description: 'Premium cotton shirt',
        reorderPoint: 10,
        reorderQuantity: 20,
        supplier: {
          name: 'Premium Suppliers',
          contact: '+91 98765 66666',
          email: 'premium@suppliers.com'
        }
      },
      {
        name: 'Designer Jeans',
        sku: 'FASH-JEAN-001',
        brand: 'Fashion Designer',
        category: 'Jeans',
        size: 'L',
        color: 'Black',
        quantity: 25,
        price: 1599,
        costPrice: 1000,
        description: 'Designer denim jeans',
        reorderPoint: 5,
        reorderQuantity: 15,
        supplier: {
          name: 'Designer Suppliers',
          contact: '+91 98765 77777',
          email: 'designer@suppliers.com'
        }
      }
    ];

    // Add products to users
    const savedSoundProducts = [];
    for (const productData of soundProducts) {
      const product = new Product({
        ...productData,
        createdBy: soundUser._id
      });
      const savedProduct = await product.save();
      savedSoundProducts.push(savedProduct);
    }

    const savedFashionProducts = [];
    for (const productData of fashionProducts) {
      const product = new Product({
        ...productData,
        createdBy: fashionUser._id
      });
      const savedProduct = await product.save();
      savedFashionProducts.push(savedProduct);
    }

    console.log('✅ Sample products created successfully!');

    // Create sample sales for sound user
    const soundSales = [
      {
        customer: {
          name: 'John Doe',
          phone: '+91 98765 11111',
          email: 'john@example.com'
        },
        items: [
          {
            product: savedSoundProducts[0]._id, // Classic White T-Shirt
            productName: 'Classic White T-Shirt',
            sku: 'SOUND-TSH-001',
            quantity: 2,
            unitPrice: 599,
            totalPrice: 1198
          }
        ],
        subtotal: 1198,
        tax: 215.64,
        discount: 100,
        total: 1313.64,
        paymentMethod: 'Cash',
        soldBy: soundUser._id,
        store: soundUser._id
      },
      {
        customer: {
          name: 'Jane Smith',
          phone: '+91 98765 22222',
          email: 'jane@example.com'
        },
        items: [
          {
            product: savedSoundProducts[1]._id, // Denim Jeans
            productName: 'Denim Jeans',
            sku: 'SOUND-JEAN-001',
            quantity: 1,
            unitPrice: 1299,
            totalPrice: 1299
          }
        ],
        subtotal: 1299,
        tax: 233.82,
        discount: 0,
        total: 1532.82,
        paymentMethod: 'UPI',
        soldBy: soundUser._id,
        store: soundUser._id
      }
    ];

    // Create sample sales for fashion user
    const fashionSales = [
      {
        customer: {
          name: 'Mike Johnson',
          phone: '+91 98765 33333',
          email: 'mike@example.com'
        },
        items: [
          {
            product: savedFashionProducts[0]._id, // Premium Cotton Shirt
            productName: 'Premium Cotton Shirt',
            sku: 'FASH-SHRT-001',
            quantity: 1,
            unitPrice: 1199,
            totalPrice: 1199
          }
        ],
        subtotal: 1199,
        tax: 215.82,
        discount: 50,
        total: 1364.82,
        paymentMethod: 'Card',
        soldBy: fashionUser._id,
        store: fashionUser._id
      }
    ];

    // Save sales
    for (const saleData of soundSales) {
      const sale = new Sale(saleData);
      await sale.save();
    }

    for (const saleData of fashionSales) {
      const sale = new Sale(saleData);
      await sale.save();
    }

    console.log('✅ Sample sales created successfully!');
    console.log('\n📋 Sample Users Created:');
    console.log('👤 Admin: admin / admin123');
    console.log('👤 Sound: sound / Sound@123');
    console.log('👤 Fashion: fashion / Fashion@123');
    console.log('\n🎉 Multi-tenant system setup complete!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleUsers(); 