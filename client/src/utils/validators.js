export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(String(phone));
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Empty', color: '#94a3b8' };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  switch (score) {
    case 1:
    case 2:
      return { score, label: 'Weak', color: '#ef4444' };
    case 3:
    case 4:
      return { score, label: 'Medium', color: '#f59e0b' };
    case 5:
      return { score, label: 'Strong', color: '#10b981' };
    default:
      return { score: 0, label: 'Too Weak', color: '#ef4444' };
  }
};
