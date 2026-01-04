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

const addSampleData = async () => {
  try {
    console.log('🔄 Adding sample data for existing users...');

    // Find existing users
    const soundUser = await User.findOne({ username: 'sound' });
    const fashionUser = await User.findOne({ username: 'fashion' });
    const adminUser = await User.findOne({ username: 'admin' });

    if (!soundUser || !fashionUser || !adminUser) {
      console.log('❌ Users not found. Please run createSampleUsers.js first.');
      return;
    }

    // Clear existing products and sales for these users
    await Product.deleteMany({ createdBy: { $in: [soundUser._id, fashionUser._id, adminUser._id] } });
    await Sale.deleteMany({ soldBy: { $in: [soundUser._id, fashionUser._id, adminUser._id] } });

    console.log('✅ Cleared existing data');

    // Create sample products for sound user
    const soundProducts = [
      { name: 'Classic White T-Shirt', sku: 'SOUND-TSH-001', brand: 'Sound Brand', category: 'T-Shirts', size: 'M', color: 'White', quantity: 50, price: 599, costPrice: 300, description: 'Premium cotton classic white t-shirt', reorderPoint: 10, reorderQuantity: 20, supplier: { name: 'Sound Suppliers', contact: '+91 98765 11111', email: 'supplier@sound.com' } },
      { name: 'Denim Jeans', sku: 'SOUND-JEAN-001', brand: 'Sound Denim', category: 'Jeans', size: 'L', color: 'Blue', quantity: 30, price: 1299, costPrice: 800, description: 'Comfortable denim jeans', reorderPoint: 5, reorderQuantity: 15, supplier: { name: 'Denim Suppliers', contact: '+91 98765 22222', email: 'denim@suppliers.com' } },
      { name: 'Casual Shirt', sku: 'SOUND-SHRT-001', brand: 'Sound Casual', category: 'Shirts', size: 'XL', color: 'Black', quantity: 25, price: 899, costPrice: 500, description: 'Stylish casual shirt', reorderPoint: 8, reorderQuantity: 12, supplier: { name: 'Casual Wear Suppliers', contact: '+91 98765 33333', email: 'casual@suppliers.com' } },
      { name: 'Summer Dress', sku: 'SOUND-DRS-001', brand: 'Sound Fashion', category: 'Dresses', size: 'M', color: 'Pink', quantity: 15, price: 1499, costPrice: 900, description: 'Beautiful summer dress', reorderPoint: 3, reorderQuantity: 10, supplier: { name: 'Dress Suppliers', contact: '+91 98765 44444', email: 'dress@suppliers.com' } },
      { name: 'Sports Jacket', sku: 'SOUND-JKT-001', brand: 'Sound Sports', category: 'Jackets', size: 'L', color: 'Red', quantity: 20, price: 1999, costPrice: 1200, description: 'Comfortable sports jacket', reorderPoint: 5, reorderQuantity: 8, supplier: { name: 'Sports Suppliers', contact: '+91 98765 55555', email: 'sports@suppliers.com' } },
      { name: 'Formal Trousers', sku: 'SOUND-TRS-001', brand: 'Sound Formal', category: 'Pants', size: 'M', color: 'Grey', quantity: 18, price: 1099, costPrice: 650, description: 'Elegant formal trousers', reorderPoint: 4, reorderQuantity: 10, supplier: { name: 'Formal Suppliers', contact: '+91 98765 66666', email: 'formal@suppliers.com' } },
      { name: 'Cotton Kurta', sku: 'SOUND-KUR-001', brand: 'Sound Ethnic', category: 'Shirts', size: 'L', color: 'Yellow', quantity: 12, price: 799, costPrice: 400, description: 'Traditional cotton kurta', reorderPoint: 2, reorderQuantity: 6, supplier: { name: 'Ethnic Suppliers', contact: '+91 98765 77777', email: 'ethnic@suppliers.com' } },
      { name: 'Cargo Shorts', sku: 'SOUND-SRT-001', brand: 'Sound Casual', category: 'Pants', size: 'L', color: 'Olive', quantity: 22, price: 699, costPrice: 350, description: 'Comfortable cargo shorts', reorderPoint: 5, reorderQuantity: 10, supplier: { name: 'Shorts Suppliers', contact: '+91 98765 88888', email: 'shorts@suppliers.com' } },
      { name: 'Woolen Sweater', sku: 'SOUND-SWT-001', brand: 'Sound Winter', category: 'Jackets', size: 'XL', color: 'Navy', quantity: 10, price: 1599, costPrice: 900, description: 'Warm woolen sweater', reorderPoint: 2, reorderQuantity: 5, supplier: { name: 'Winter Suppliers', contact: '+91 98765 99999', email: 'winter@suppliers.com' } },
      { name: 'Track Pants', sku: 'SOUND-TRK-001', brand: 'Sound Sports', category: 'Pants', size: 'XL', color: 'Black', quantity: 16, price: 899, costPrice: 500, description: 'Stretchable track pants', reorderPoint: 3, reorderQuantity: 8, supplier: { name: 'Track Suppliers', contact: '+91 98765 10101', email: 'track@suppliers.com' } },
      { name: 'Printed T-Shirt', sku: 'SOUND-TSH-002', brand: 'Sound Prints', category: 'T-Shirts', size: 'S', color: 'Green', quantity: 28, price: 499, costPrice: 250, description: 'Trendy printed t-shirt', reorderPoint: 6, reorderQuantity: 12, supplier: { name: 'Print Suppliers', contact: '+91 98765 20202', email: 'print@suppliers.com' } },
      { name: 'Leather Belt', sku: 'SOUND-BLT-001', brand: 'Sound Accessories', category: 'Accessories', size: 'Free Size', color: 'Brown', quantity: 35, price: 399, costPrice: 200, description: 'Genuine leather belt', reorderPoint: 7, reorderQuantity: 15, supplier: { name: 'Accessories Suppliers', contact: '+91 98765 30303', email: 'accessories@suppliers.com' } },
      { name: 'Canvas Shoes', sku: 'SOUND-SHO-001', brand: 'Sound Footwear', category: 'Shoes', size: 'Free Size', color: 'White', quantity: 14, price: 1299, costPrice: 700, description: 'Durable canvas shoes', reorderPoint: 3, reorderQuantity: 7, supplier: { name: 'Footwear Suppliers', contact: '+91 98765 40404', email: 'footwear@suppliers.com' } },
      { name: 'Hooded Sweatshirt', sku: 'SOUND-HOOD-001', brand: 'Sound Winter', category: 'Jackets', size: 'L', color: 'Grey', quantity: 11, price: 1399, costPrice: 800, description: 'Cozy hooded sweatshirt', reorderPoint: 2, reorderQuantity: 5, supplier: { name: 'Winter Suppliers', contact: '+91 98765 50505', email: 'winter@suppliers.com' } },
      { name: 'Formal Blazer', sku: 'SOUND-BLAZ-001', brand: 'Sound Formal', category: 'Jackets', size: 'L', color: 'Navy', quantity: 8, price: 2999, costPrice: 1800, description: 'Elegant formal blazer', reorderPoint: 1, reorderQuantity: 3, supplier: { name: 'Blazer Suppliers', contact: '+91 98765 60606', email: 'blazer@suppliers.com' } }
    ];

    // Create sample products for fashion user
    const fashionProducts = [
      { name: 'Premium Cotton Shirt', sku: 'FASH-SHRT-001', brand: 'Fashion Premium', category: 'Shirts', size: 'M', color: 'White', quantity: 40, price: 1199, costPrice: 700, description: 'Premium cotton shirt', reorderPoint: 10, reorderQuantity: 20, supplier: { name: 'Premium Suppliers', contact: '+91 98765 66666', email: 'premium@suppliers.com' } },
      { name: 'Designer Jeans', sku: 'FASH-JEAN-001', brand: 'Fashion Designer', category: 'Jeans', size: 'L', color: 'Black', quantity: 25, price: 1599, costPrice: 1000, description: 'Designer denim jeans', reorderPoint: 5, reorderQuantity: 15, supplier: { name: 'Designer Suppliers', contact: '+91 98765 77777', email: 'designer@suppliers.com' } },
      { name: 'Party Dress', sku: 'FASH-DRS-001', brand: 'Fashion Party', category: 'Dresses', size: 'S', color: 'Red', quantity: 12, price: 2499, costPrice: 1500, description: 'Glamorous party dress', reorderPoint: 2, reorderQuantity: 6, supplier: { name: 'Party Suppliers', contact: '+91 98765 88888', email: 'party@suppliers.com' } },
      { name: 'Slim Fit Trousers', sku: 'FASH-TRS-001', brand: 'Fashion Slim', category: 'Pants', size: 'M', color: 'Beige', quantity: 18, price: 1399, costPrice: 800, description: 'Slim fit formal trousers', reorderPoint: 4, reorderQuantity: 10, supplier: { name: 'Slim Suppliers', contact: '+91 98765 99999', email: 'slim@suppliers.com' } },
      { name: 'Printed Kurti', sku: 'FASH-KUR-001', brand: 'Fashion Ethnic', category: 'Shirts', size: 'L', color: 'Blue', quantity: 15, price: 999, costPrice: 500, description: 'Trendy printed kurti', reorderPoint: 3, reorderQuantity: 8, supplier: { name: 'Ethnic Suppliers', contact: '+91 98765 10101', email: 'ethnic@suppliers.com' } },
      { name: 'Denim Shorts', sku: 'FASH-SRT-001', brand: 'Fashion Casual', category: 'Pants', size: 'L', color: 'Denim', quantity: 20, price: 799, costPrice: 400, description: 'Trendy denim shorts', reorderPoint: 5, reorderQuantity: 10, supplier: { name: 'Shorts Suppliers', contact: '+91 98765 20202', email: 'shorts@suppliers.com' } },
      { name: 'Woolen Cardigan', sku: 'FASH-SWT-001', brand: 'Fashion Winter', category: 'Jackets', size: 'XL', color: 'Maroon', quantity: 10, price: 1799, costPrice: 1000, description: 'Warm woolen cardigan', reorderPoint: 2, reorderQuantity: 5, supplier: { name: 'Winter Suppliers', contact: '+91 98765 30303', email: 'winter@suppliers.com' } },
      { name: 'Yoga Track Pants', sku: 'FASH-TRK-001', brand: 'Fashion Sports', category: 'Pants', size: 'XL', color: 'Black', quantity: 16, price: 999, costPrice: 600, description: 'Yoga track pants', reorderPoint: 3, reorderQuantity: 8, supplier: { name: 'Track Suppliers', contact: '+91 98765 40404', email: 'track@suppliers.com' } },
      { name: 'Graphic T-Shirt', sku: 'FASH-TSH-001', brand: 'Fashion Prints', category: 'T-Shirts', size: 'S', color: 'Purple', quantity: 28, price: 599, costPrice: 300, description: 'Cool graphic t-shirt', reorderPoint: 6, reorderQuantity: 12, supplier: { name: 'Print Suppliers', contact: '+91 98765 50505', email: 'print@suppliers.com' } },
      { name: 'Leather Wallet', sku: 'FASH-WLT-001', brand: 'Fashion Accessories', category: 'Accessories', size: 'Free Size', color: 'Tan', quantity: 35, price: 499, costPrice: 250, description: 'Genuine leather wallet', reorderPoint: 7, reorderQuantity: 15, supplier: { name: 'Accessories Suppliers', contact: '+91 98765 60606', email: 'accessories@suppliers.com' } },
      { name: 'Sneakers', sku: 'FASH-SHO-001', brand: 'Fashion Footwear', category: 'Shoes', size: 'Free Size', color: 'Grey', quantity: 14, price: 1499, costPrice: 900, description: 'Trendy sneakers', reorderPoint: 3, reorderQuantity: 7, supplier: { name: 'Footwear Suppliers', contact: '+91 98765 70707', email: 'footwear@suppliers.com' } },
      { name: 'Zipper Hoodie', sku: 'FASH-HOOD-001', brand: 'Fashion Winter', category: 'Jackets', size: 'L', color: 'Black', quantity: 11, price: 1599, costPrice: 900, description: 'Warm zipper hoodie', reorderPoint: 2, reorderQuantity: 5, supplier: { name: 'Winter Suppliers', contact: '+91 98765 80808', email: 'winter@suppliers.com' } },
      { name: 'Formal Waistcoat', sku: 'FASH-WC-001', brand: 'Fashion Formal', category: 'Jackets', size: 'L', color: 'Grey', quantity: 8, price: 1999, costPrice: 1200, description: 'Classic formal waistcoat', reorderPoint: 1, reorderQuantity: 3, supplier: { name: 'Waistcoat Suppliers', contact: '+91 98765 90909', email: 'waistcoat@suppliers.com' } },
      { name: 'Chinos', sku: 'FASH-CHN-001', brand: 'Fashion Casual', category: 'Pants', size: 'M', color: 'Khaki', quantity: 18, price: 1199, costPrice: 700, description: 'Comfortable chinos', reorderPoint: 4, reorderQuantity: 10, supplier: { name: 'Chino Suppliers', contact: '+91 98765 11112', email: 'chino@suppliers.com' } },
      { name: 'Printed Scarf', sku: 'FASH-SCF-001', brand: 'Fashion Accessories', category: 'Accessories', size: 'Free Size', color: 'Multi', quantity: 20, price: 399, costPrice: 200, description: 'Colorful printed scarf', reorderPoint: 5, reorderQuantity: 10, supplier: { name: 'Scarf Suppliers', contact: '+91 98765 12121', email: 'scarf@suppliers.com' } }
    ];

    // Create sample products for admin user (Cloth-IN)
    const adminProducts = [
      { name: 'Premium Cotton Polo', sku: 'CLOTH-POLO-001', brand: 'Cloth-IN Premium', category: 'T-Shirts', size: 'M', color: 'Navy', quantity: 45, price: 899, costPrice: 500, description: 'Premium cotton polo shirt', reorderPoint: 10, reorderQuantity: 20, supplier: { name: 'Cloth-IN Suppliers', contact: '+91 98765 11111', email: 'supplier@clothin.com' } },
      { name: 'Slim Fit Denim', sku: 'CLOTH-JEAN-001', brand: 'Cloth-IN Denim', category: 'Jeans', size: 'L', color: 'Dark Blue', quantity: 35, price: 1499, costPrice: 900, description: 'Slim fit denim jeans', reorderPoint: 8, reorderQuantity: 15, supplier: { name: 'Denim Suppliers', contact: '+91 98765 22222', email: 'denim@clothin.com' } },
      { name: 'Formal Business Shirt', sku: 'CLOTH-SHRT-001', brand: 'Cloth-IN Formal', category: 'Shirts', size: 'XL', color: 'White', quantity: 30, price: 1299, costPrice: 700, description: 'Professional business shirt', reorderPoint: 6, reorderQuantity: 12, supplier: { name: 'Formal Suppliers', contact: '+91 98765 33333', email: 'formal@clothin.com' } },
      { name: 'Evening Gown', sku: 'CLOTH-DRS-001', brand: 'Cloth-IN Elegance', category: 'Dresses', size: 'S', color: 'Black', quantity: 8, price: 3999, costPrice: 2500, description: 'Elegant evening gown', reorderPoint: 2, reorderQuantity: 5, supplier: { name: 'Dress Suppliers', contact: '+91 98765 44444', email: 'dress@clothin.com' } },
      { name: 'Leather Jacket', sku: 'CLOTH-JKT-001', brand: 'Cloth-IN Leather', category: 'Jackets', size: 'L', color: 'Black', quantity: 12, price: 2999, costPrice: 1800, description: 'Genuine leather jacket', reorderPoint: 3, reorderQuantity: 8, supplier: { name: 'Leather Suppliers', contact: '+91 98765 55555', email: 'leather@clothin.com' } },
      { name: 'Tailored Trousers', sku: 'CLOTH-TRS-001', brand: 'Cloth-IN Tailored', category: 'Pants', size: 'M', color: 'Charcoal', quantity: 25, price: 1699, costPrice: 1000, description: 'Tailored formal trousers', reorderPoint: 5, reorderQuantity: 10, supplier: { name: 'Tailored Suppliers', contact: '+91 98765 66666', email: 'tailored@clothin.com' } },
      { name: 'Designer Kurta', sku: 'CLOTH-KUR-001', brand: 'Cloth-IN Ethnic', category: 'Shirts', size: 'L', color: 'Maroon', quantity: 18, price: 1199, costPrice: 600, description: 'Designer ethnic kurta', reorderPoint: 4, reorderQuantity: 8, supplier: { name: 'Ethnic Suppliers', contact: '+91 98765 77777', email: 'ethnic@clothin.com' } },
      { name: 'Cargo Pants', sku: 'CLOTH-CRG-001', brand: 'Cloth-IN Casual', category: 'Pants', size: 'L', color: 'Olive', quantity: 22, price: 999, costPrice: 500, description: 'Comfortable cargo pants', reorderPoint: 5, reorderQuantity: 10, supplier: { name: 'Cargo Suppliers', contact: '+91 98765 88888', email: 'cargo@clothin.com' } },
      { name: 'Cashmere Sweater', sku: 'CLOTH-SWT-001', brand: 'Cloth-IN Luxury', category: 'Jackets', size: 'XL', color: 'Cream', quantity: 10, price: 2499, costPrice: 1500, description: 'Luxury cashmere sweater', reorderPoint: 2, reorderQuantity: 5, supplier: { name: 'Luxury Suppliers', contact: '+91 98765 99999', email: 'luxury@clothin.com' } },
      { name: 'Athletic Pants', sku: 'CLOTH-ATH-001', brand: 'Cloth-IN Sports', category: 'Pants', size: 'XL', color: 'Grey', quantity: 20, price: 1299, costPrice: 700, description: 'High-performance athletic pants', reorderPoint: 4, reorderQuantity: 8, supplier: { name: 'Sports Suppliers', contact: '+91 98765 10101', email: 'sports@clothin.com' } },
      { name: 'Vintage T-Shirt', sku: 'CLOTH-TSH-001', brand: 'Cloth-IN Vintage', category: 'T-Shirts', size: 'S', color: 'Vintage White', quantity: 32, price: 699, costPrice: 350, description: 'Vintage style t-shirt', reorderPoint: 7, reorderQuantity: 12, supplier: { name: 'Vintage Suppliers', contact: '+91 98765 20202', email: 'vintage@clothin.com' } },
      { name: 'Designer Belt', sku: 'CLOTH-BLT-001', brand: 'Cloth-IN Accessories', category: 'Accessories', size: 'Free Size', color: 'Black', quantity: 40, price: 599, costPrice: 300, description: 'Designer leather belt', reorderPoint: 8, reorderQuantity: 15, supplier: { name: 'Accessories Suppliers', contact: '+91 98765 30303', email: 'accessories@clothin.com' } },
      { name: 'Formal Shoes', sku: 'CLOTH-SHO-001', brand: 'Cloth-IN Footwear', category: 'Shoes', size: 'Free Size', color: 'Brown', quantity: 16, price: 1999, costPrice: 1200, description: 'Premium formal shoes', reorderPoint: 3, reorderQuantity: 7, supplier: { name: 'Footwear Suppliers', contact: '+91 98765 40404', email: 'footwear@clothin.com' } },
      { name: 'Woolen Coat', sku: 'CLOTH-COAT-001', brand: 'Cloth-IN Winter', category: 'Jackets', size: 'L', color: 'Navy', quantity: 8, price: 3999, costPrice: 2400, description: 'Warm woolen coat', reorderPoint: 2, reorderQuantity: 4, supplier: { name: 'Winter Suppliers', contact: '+91 98765 50505', email: 'winter@clothin.com' } },
      { name: 'Business Suit', sku: 'CLOTH-SUIT-001', brand: 'Cloth-IN Business', category: 'Jackets', size: 'L', color: 'Navy', quantity: 6, price: 5999, costPrice: 3600, description: 'Professional business suit', reorderPoint: 1, reorderQuantity: 3, supplier: { name: 'Business Suppliers', contact: '+91 98765 60606', email: 'business@clothin.com' } }
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

    const savedAdminProducts = [];
    for (const productData of adminProducts) {
      const product = new Product({
        ...productData,
        createdBy: adminUser._id
      });
      const savedProduct = await product.save();
      savedAdminProducts.push(savedProduct);
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
            product: savedSoundProducts[0]._id,
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
            product: savedSoundProducts[1]._id,
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
            product: savedFashionProducts[0]._id,
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

    // Create sample sales for admin user
    const adminSales = [
      {
        customer: {
          name: 'Sarah Wilson',
          phone: '+91 98765 44444',
          email: 'sarah@example.com'
        },
        items: [
          {
            product: savedAdminProducts[0]._id,
            productName: 'Premium Cotton Polo',
            sku: 'CLOTH-POLO-001',
            quantity: 1,
            unitPrice: 899,
            totalPrice: 899
          },
          {
            product: savedAdminProducts[1]._id,
            productName: 'Slim Fit Denim',
            sku: 'CLOTH-JEAN-001',
            quantity: 1,
            unitPrice: 1499,
            totalPrice: 1499
          }
        ],
        subtotal: 2398,
        tax: 431.64,
        discount: 200,
        total: 2629.64,
        paymentMethod: 'Card',
        soldBy: adminUser._id,
        store: adminUser._id
      },
      {
        customer: {
          name: 'David Brown',
          phone: '+91 98765 55555',
          email: 'david@example.com'
        },
        items: [
          {
            product: savedAdminProducts[2]._id,
            productName: 'Formal Business Shirt',
            sku: 'CLOTH-SHRT-001',
            quantity: 2,
            unitPrice: 1299,
            totalPrice: 2598
          }
        ],
        subtotal: 2598,
        tax: 467.64,
        discount: 0,
        total: 3065.64,
        paymentMethod: 'UPI',
        soldBy: adminUser._id,
        store: adminUser._id
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

    for (const saleData of adminSales) {
      const sale = new Sale(saleData);
      await sale.save();
    }

    console.log('✅ Sample sales created successfully!');
    console.log('\n📋 Sample Data Added:');
    console.log(`👤 Sound Store: ${savedSoundProducts.length} products, ${soundSales.length} sales`);
    console.log(`👤 Fashion Boutique: ${savedFashionProducts.length} products, ${fashionSales.length} sales`);
    console.log(`👤 Cloth-IN (Admin): ${savedAdminProducts.length} products, ${adminSales.length} sales`);
    console.log('\n🎉 Multi-tenant sample data setup complete!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

addSampleData(); 