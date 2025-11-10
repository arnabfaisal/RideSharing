const validator = require('validator');

function isUniversityEmail(email) {
  if (!validator.isEmail(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase() || '';
  // Basic check: domain ends with .edu (handles subdomains like uni.school.edu)
  return domain.endsWith('.edu');
}

module.exports = { isUniversityEmail };
