const sequelize = require('../config/sequelize');
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');
const Payment = require('./Payment');
const Assignment = require('./Assignment');
const AssignmentSubmission = require('./AssignmentSubmission');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizAttempt = require('./QuizAttempt');

// Associations
User.hasMany(Course, { foreignKey: 'instructor_id' });
Course.belongsTo(User, { foreignKey: 'instructor_id' });

User.belongsToMany(Course, { through: Enrollment, foreignKey: 'user_id' });
Course.belongsToMany(User, { through: Enrollment, foreignKey: 'course_id' });

Enrollment.belongsTo(User, { foreignKey: 'user_id' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });
User.hasMany(Enrollment, { foreignKey: 'user_id' });
Course.hasMany(Enrollment, { foreignKey: 'course_id' });

Payment.belongsTo(User, { foreignKey: 'user_id' });
Payment.belongsTo(Course, { foreignKey: 'course_id' });
User.hasMany(Payment, { foreignKey: 'user_id' });
Course.hasMany(Payment, { foreignKey: 'course_id' });

Course.hasMany(Assignment, { foreignKey: 'course_id' });
Assignment.belongsTo(Course, { foreignKey: 'course_id' });

Assignment.hasMany(AssignmentSubmission, { foreignKey: 'assignment_id' });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: 'assignment_id' });
User.hasMany(AssignmentSubmission, { foreignKey: 'user_id' });
AssignmentSubmission.belongsTo(User, { foreignKey: 'user_id' });

Course.hasMany(Quiz, { foreignKey: 'course_id' });
Quiz.belongsTo(Course, { foreignKey: 'course_id' });

Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id' });

Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });
User.hasMany(QuizAttempt, { foreignKey: 'user_id' });
QuizAttempt.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Course,
  Enrollment,
  Payment,
  Assignment,
  AssignmentSubmission,
  Quiz,
  QuizQuestion,
  QuizAttempt,
};
