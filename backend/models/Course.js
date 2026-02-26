const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Course = sequelize.define(
  'Course',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    instructor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'courses',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['instructor_id'] }],
  }
);

module.exports = Course;
