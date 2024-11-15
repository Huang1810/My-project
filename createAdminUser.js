const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Database configuration
const uri = 'mongodb://localhost:27017';
const dbName = 'auth_demo';
const client = new MongoClient(uri);

async function createAdminUser() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if admin user already exists
    const adminUser = await usersCollection.findOne({ email: 'admin@example.com' });
    if (adminUser) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newAdmin = {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      isAdmin: true,
    };

    await usersCollection.insertOne(newAdmin);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();
