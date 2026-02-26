const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const QuizQuestion = sequelize.define(
  'QuizQuestion',
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
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of option strings',
    },
    correct_option_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '0-based index of correct option',
    },
  },
  {
    tableName: 'quiz_questions',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['quiz_id'] }],
  }
);

module.exports = QuizQuestion;
