// import DOMpurify from "dompurify";

const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isValidName = (name: string): boolean => {
  const re = /^[A-Za-z\s]+$/;
  return name.length >= 2 && re.test(name);
};

const isEmpty = (value: string): boolean => value.trim() === "";

const requiredMessage = (field: string) => `${field} is required`;

export const validateName = (name: string): string | null => {
  if (isEmpty(name)) return requiredMessage("Name");
  if (!isValidName(name)) return "Invalid name";

  return null;
};

export const validateEmail = (email: string): string | null => {
  //   email = DOMpurify.sanitize(email);
  if (isEmpty(email)) return requiredMessage("Email address");
  if (!isValidEmail(email)) return "Invalid email address";
  return null;
};

export const validatePassword = (
  password: string,
  component: string
): string | null => {
  //   password = DOMpurify.sanitize(password);
  if (isEmpty(password)) return requiredMessage("Password");

  if (component === "signup" && password.length < 12) {
    return "Password must be at least 12 characters";
  }

  return null;
};

export const validateRepeatPassword = (
  repeatPassword: string,
  originalPassword: string
): string | null => {
  //   originalPassword = DOMpurify.sanitize(originalPassword);
  if (isEmpty(repeatPassword)) return requiredMessage("Password");
  if (repeatPassword !== originalPassword) return "Passwords do not match";
  return null;
};
