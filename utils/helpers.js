const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateRegistration = (data) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push("Full name must be at least 2 characters.");
  }
  if (!data.email || !validateEmail(data.email)) {
    errors.push("Valid email is required.");
  }
  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }
  if (!data.gender || !["male", "female"].includes(data.gender.toLowerCase())) {
    errors.push("Gender must be male or female.");
  }
  if (!data.dateOfBirth) {
    errors.push("Date of birth is required.");
  } else {
    const age = calculateAge(data.dateOfBirth);
    if (age < 18) {
      errors.push("You must be at least 18 years old.");
    }
  }

  return errors;
};

const sanitizeUser = (user) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

module.exports = { calculateAge, validateEmail, validateRegistration, sanitizeUser };
