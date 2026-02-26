const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'courses', key: 'id' },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR',
    },
    gateway_order_id: {
      type: DataTypes.STRING(255),
    },
    gateway_txn_id: {
      type: DataTypes.STRING(255),
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    receipt_url: {
      type: DataTypes.STRING(500),
    },
  },
  {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['course_id'] },
      { fields: ['user_id', 'course_id'] },
    ],
  }
);

module.exports = Payment;
