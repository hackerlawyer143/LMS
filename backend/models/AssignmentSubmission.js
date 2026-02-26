const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AssignmentSubmission = sequelize.define(
  'AssignmentSubmission',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'assignments', key: 'id' },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    marks: {
      type: DataTypes.INTEGER,
    },
    feedback: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'assignment_submissions',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['assignment_id', 'user_id'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = AssignmentSubmission;
