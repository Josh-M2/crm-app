export type LoginFormTypes = {
  email: string;
  password: string;
};

export type ErrorLoginFormTypes = {
  emailError: string | null;
  passwordError: string | null;
};

export type SignupFormTypes = {
  name: string;
  email: string;
  password: string;
  repassword: string;
};

export type ErrorSignupFormTypes = {
  nameError: string | null;
  emailError: string | null;
  passwordError: string | null;
  repasswordError: string | null;
};
