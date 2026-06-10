import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChangeEvent } from "react";
import { inputChange } from "@/app/lib/inputChange";

type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = {
  emailError: string | null;
  passwordError: string | null;
};

const createEvent = (
  name: string,
  value: string
): ChangeEvent<HTMLInputElement> =>
  ({
    target: {
      name,
      value,
    },
  } as ChangeEvent<HTMLInputElement>);

const applySetter = <T>(state: T, setter: unknown) =>
  typeof setter === "function" ? (setter as (prev: T) => T)(state) : setter;

describe("inputChange", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates the matching form field", () => {
    const form: LoginForm = { email: "", password: "" };
    const errors: LoginErrors = { emailError: "", passwordError: "" };
    const setForm = vi.fn();
    const setError = vi.fn();

    inputChange({
      e: createEvent("email", "jane@example.com"),
      setForm,
      setError,
      form,
      componentName: "login",
    });

    expect(applySetter(form, setForm.mock.calls[0][0])).toEqual({
      email: "jane@example.com",
      password: "",
    });
    expect(applySetter(errors, setError.mock.calls[0][0])).toEqual({
      emailError: null,
      passwordError: "",
    });
  });

  it("validates password using the current component name", () => {
    const form: LoginForm = { email: "", password: "" };
    const errors: LoginErrors = { emailError: "", passwordError: "" };
    const setForm = vi.fn();
    const setError = vi.fn();

    inputChange({
      e: createEvent("password", "short"),
      setForm,
      setError,
      form,
      componentName: "signup",
    });

    expect(applySetter(errors, setError.mock.calls[0][0])).toEqual({
      emailError: "",
      passwordError: "Password must be at least 12 characters",
    });
  });
});
