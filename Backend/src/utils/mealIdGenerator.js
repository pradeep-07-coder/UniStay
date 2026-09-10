const crypto = require('crypto');

/**
 * Generates a unique Digital Meal ID string
 * Format: MEAL-2026-X8F92A
 */
const generateMealId = () => {
  const prefix = 'MEAL';
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${randomHex}`;
};

module.exports = { generateMealId };