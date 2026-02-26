require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

const SALT_ROUNDS = 10;

async function seed() {
  try {
    await sequelize.sync();
    const existing = await User.findOne({ where: { role: 'admin' } });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
      process.exit(0);
      return;
    }
    const password_hash = await bcrypt.hash('admin123', SALT_ROUNDS);
    await User.create({
      email: 'admin@lms.local',
      password_hash,
      full_name: 'Admin',
      role: 'admin',
      status: 'active',
    });
    console.log('Created admin user: admin@lms.local / admin123');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
