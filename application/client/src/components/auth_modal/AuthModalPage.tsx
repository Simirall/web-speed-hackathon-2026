import { useState } from "react";
import { useFormStatus } from "react-dom";

import { AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/types";
import { validate } from "@web-speed-hackathon-2026/client/src/auth/validation";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { Link } from "@web-speed-hackathon-2026/client/src/components/foundation/Link";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";

interface Props {
  onRequestCloseModal: () => void;
  onSubmit: (values: AuthFormData) => Promise<string | null>;
}

const SubmitButton = ({ disabled, type }: { disabled: boolean; type: "signin" | "signup" }) => {
  const { pending } = useFormStatus();

  return (
    <ModalSubmitButton disabled={disabled || pending} loading={pending}>
      {type === "signin" ? "サインイン" : "登録する"}
    </ModalSubmitButton>
  );
};

export const AuthModalPage = ({ onRequestCloseModal, onSubmit }: Props) => {
  const [values, setValues] = useState<AuthFormData>({
    type: "signin",
    username: "",
    name: "",
    password: "",
  });
  const [dirtyFields, setDirtyFields] = useState<Record<"username" | "name" | "password", boolean>>({
    username: false,
    name: false,
    password: false,
  });
  const [error, setError] = useState<string | null>(null);

  const validationErrors = validate(values);
  const type = values.type;
  const isInvalid = Object.keys(validationErrors).length > 0;

  const getFieldError = (fieldName: "username" | "name" | "password") => {
    if (!dirtyFields[fieldName]) {
      return undefined;
    }

    return validationErrors[fieldName];
  };

  const handleAction = async (formData: FormData) => {
    const nextValues: AuthFormData = {
      type: (formData.get("type") === "signup" ? "signup" : "signin") as AuthFormData["type"],
      username: String(formData.get("username") ?? ""),
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const nextValidationErrors = validate(nextValues);

    setDirtyFields({
      username: true,
      name: true,
      password: true,
    });

    if (Object.keys(nextValidationErrors).length > 0) {
      setError(null);
      return;
    }

    const nextError = await onSubmit(nextValues);
    setError(nextError);
  };

  return (
    <form action={handleAction} className="grid gap-y-6">
      <input name="type" type="hidden" value={type} />

      <h2 className="text-center text-2xl font-bold">
        {type === "signin" ? "サインイン" : "新規登録"}
      </h2>

      <div className="flex justify-center">
        <button
          className="text-cax-brand underline"
          onClick={() => {
            setValues((currentValues) => ({
              ...currentValues,
              type: currentValues.type === "signin" ? "signup" : "signin",
            }));
            setError(null);
          }}
          type="button"
        >
          {type === "signin" ? "初めての方はこちら" : "サインインはこちら"}
        </button>
      </div>

      <div className="grid gap-y-2">
        <FormInputField
          name="username"
          label="ユーザー名"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          autoComplete="username"
          value={values.username}
          onChange={(event) => {
            setValues((currentValues) => ({ ...currentValues, username: event.target.value }));
            setDirtyFields((currentFields) => ({ ...currentFields, username: true }));
            setError(null);
          }}
          errorMessage={getFieldError("username")}
        />

        {type === "signup" && (
          <FormInputField
            name="name"
            label="名前"
            autoComplete="nickname"
            value={values.name}
            onChange={(event) => {
              setValues((currentValues) => ({ ...currentValues, name: event.target.value }));
              setDirtyFields((currentFields) => ({ ...currentFields, name: true }));
              setError(null);
            }}
            errorMessage={getFieldError("name")}
          />
        )}

        <FormInputField
          name="password"
          label="パスワード"
          type="password"
          autoComplete={type === "signup" ? "new-password" : "current-password"}
          value={values.password}
          onChange={(event) => {
            setValues((currentValues) => ({ ...currentValues, password: event.target.value }));
            setDirtyFields((currentFields) => ({ ...currentFields, password: true }));
            setError(null);
          }}
          errorMessage={getFieldError("password")}
        />
      </div>

      {type === "signup" ? (
        <p>
          <Link className="text-cax-brand underline" onClick={onRequestCloseModal} to="/terms">
            利用規約
          </Link>
          に同意して
        </p>
      ) : null}

      <SubmitButton disabled={isInvalid} type={type} />

      <ModalErrorMessage>{error}</ModalErrorMessage>
    </form>
  );
};
