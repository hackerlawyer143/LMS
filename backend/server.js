require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = () => {
    server.close(() => {
      sequelize.close().then(() => process.exit(0));
    });
  };
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
