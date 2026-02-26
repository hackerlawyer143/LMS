const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'faculty', 'student'),
      allowNull: false,
      defaultValue: 'student',
    },
    status: {
      type: DataTypes.ENUM('active', 'blocked'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [{ unique: true, fields: ['email'] }],
  }
);

module.exports = User;
