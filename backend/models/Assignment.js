const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Assignment = sequelize.define(
  'Assignment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'courses', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    max_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
  },
  {
    tableName: 'assignments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['course_id'] },
      { fields: ['deadline'] },
    ],
  }
);

module.exports = Assignment;
