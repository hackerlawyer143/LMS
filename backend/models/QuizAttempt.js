const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const QuizAttempt = sequelize.define(
  'QuizAttempt',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'quizzes', key: 'id' },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Object: questionId -> selectedOptionIndex',
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'quiz_attempts',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['quiz_id', 'user_id'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = QuizAttempt;
