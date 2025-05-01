import {
  ErrorSignupFormTypes,
  SignupFormTypes,
} from "@/app/(auth)/signup/page";
import { ChangeEvent, SetStateAction } from "react";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRepeatPassword,
} from "./validators";
import { ErrorLoginFormTypes, LoginFormTypes } from "@/app/(auth)/login/page";

type HandeleChangeParams = {
  e: ChangeEvent<HTMLInputElement>;
  setForm:
    | React.Dispatch<SetStateAction<LoginFormTypes>>
    | React.Dispatch<SetStateAction<SignupFormTypes>>;
  setError:
    | React.Dispatch<SetStateAction<ErrorLoginFormTypes>>
    | React.Dispatch<SetStateAction<ErrorSignupFormTypes>>;
  form: LoginFormTypes | SignupFormTypes;
  componentName?: string;
};

export const inputChange = ({
  e,
  setForm,
  setError,
  form,
  componentName,
}: HandeleChangeParams) => {
  console.log("functionining");
  console.log("componentName", componentName);
  const { name, value } = e.target;

  setForm((prev: any) => ({ ...prev, [name]: value }));

  switch (name) {
    case "name":
      console.log("functionining");
      setError((prev: any) => ({
        ...prev,
        nameError: validateName(value),
      }));
      break;
    case "email":
      setError((prev: any) => ({
        ...prev,
        emailError: validateEmail(value),
      }));

      break;
    case "password":
      setError((prev: any) => ({
        ...prev,
        passwordError: validatePassword(value, componentName as string),
      }));
      break;
    case "repassword":
      setError((prev: any) => ({
        ...prev,
        repasswordError: validateRepeatPassword(value, form.password),
      }));
      break;
    default:
      break;
  }
};
