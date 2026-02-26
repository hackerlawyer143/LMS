const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Quiz = sequelize.define(
  'Quiz',
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
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    duration_mins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
  },
  {
    tableName: 'quizzes',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['course_id'] }],
  }
);

module.exports = Quiz;
