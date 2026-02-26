const path = require('path');
const fs = require('fs');
const { sequelize } = require('../models');

async function run() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
