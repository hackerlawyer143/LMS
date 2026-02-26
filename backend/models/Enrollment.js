const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Enrollment = sequelize.define(
  'Enrollment',
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
    status: {
      type: DataTypes.ENUM('active', 'completed'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    tableName: 'enrollments',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'course_id'] },
      { fields: ['course_id'] },
    ],
  }
);

module.exports = Enrollment;
