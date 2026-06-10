import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRepeatPassword,
} from "./validators";

type HandeleChangeParams<
  TForm extends object,
  TError extends object
> = {
  e: ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  setForm: Dispatch<SetStateAction<TForm>>;
  setError: Dispatch<SetStateAction<TError>>;
  form: TForm;
  componentName?: string;
};

export const inputChange = <TForm extends object, TError extends object>({
  e,
  setForm,
  setError,
  form,
  componentName,
}: HandeleChangeParams<TForm, TError>) => {
  console.log("functionining");
  console.log("componentName", componentName);
  console.log("value: ", e.target.value);
  console.log("target: ", e.target.name);
  console.log("form: ", form);

  const { name, value } = e.target;

  setForm((prev) => ({ ...prev, [name]: value } as TForm));

  switch (name) {
    case "name":
      // console.log("functionining");
      setError((prev) => ({
        ...prev,
        nameError: validateName(value),
      } as TError));
      break;
    case "owner":
      // console.log("functionining");
      setError((prev) => ({
        ...prev,
        ownerError: validateName(value),
      } as TError));
      break;

    case "company":
      // console.log("functionining");
      setError((prev) => ({
        ...prev,
        companyError: validateName(value),
      } as TError));
      break;
    case "email":
      setError((prev) => ({
        ...prev,
        emailError: validateEmail(value),
      } as TError));

      break;

    case "password":
      setError((prev) => ({
        ...prev,
        passwordError: validatePassword(value, componentName as string),
      } as TError));
      break;
    case "repassword":
      setError((prev) => ({
        ...prev,
        repasswordError: validateRepeatPassword(
          value,
          "password" in form && typeof form.password === "string"
            ? form.password
            : ""
        ),
      } as TError));
      break;
    default:
      break;
  }
};
