import { ChangeEvent, useState } from "react";
import { useFormStatus } from "react-dom";

import { AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/types";
import { AuthFormErrors, validate } from "@web-speed-hackathon-2026/client/src/auth/validation";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { Link } from "@web-speed-hackathon-2026/client/src/components/foundation/Link";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";

interface Props {
  onRequestCloseModal: () => void;
  onSubmit: (values: AuthFormData) => Promise<string | null>;
}

type AuthFieldName = "username" | "name" | "password";

const INITIAL_DIRTY_FIELDS: Record<AuthFieldName, boolean> = {
  username: false,
  name: false,
  password: false,
};

const INITIAL_FORM_VALUES: AuthFormData = {
  type: "signin",
  username: "",
  name: "",
  password: "",
};

const SubmitButton = ({ disabled, type }: { disabled: boolean; type: "signin" | "signup" }) => {
  const { pending } = useFormStatus();

  return (
    <ModalSubmitButton disabled={disabled || pending} loading={pending}>
      {type === "signin" ? "サインイン" : "登録する"}
    </ModalSubmitButton>
  );
};

export const AuthModalPage = ({ onRequestCloseModal, onSubmit }: Props) => {
  const [formValues, setFormValues] = useState<AuthFormData>(INITIAL_FORM_VALUES);
  const [dirtyFields, setDirtyFields] = useState<Record<AuthFieldName, boolean>>(INITIAL_DIRTY_FIELDS);
  const [error, setError] = useState<string | null>(null);

  const validationErrors: AuthFormErrors = validate(formValues);
  const isSubmitDisabled = Object.keys(validationErrors).length > 0;
  const type = formValues.type;

  const getFieldError = (fieldName: AuthFieldName) => {
    if (!dirtyFields[fieldName]) {
      return undefined;
    }

    return validationErrors[fieldName];
  };

  const markFieldDirty = (fieldName: AuthFieldName) => {
    setDirtyFields((currentFields) => ({
      ...currentFields,
      [fieldName]: true,
    }));
  };

  const handleFieldChange = (fieldName: AuthFieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;

    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: nextValue,
    }));
    markFieldDirty(fieldName);
    if (error !== null) {
      setError(null);
    }
  };

  const handleAction = async (formData: FormData) => {
    const nextValues: AuthFormData = {
      type: formData.get("type") === "signup" ? "signup" : "signin",
      username: String(formData.get("username") ?? ""),
      name: String(formData.get("name") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const nextValidationErrors = validate(nextValues);

    setDirtyFields({ ...INITIAL_DIRTY_FIELDS, username: true, name: true, password: true });
    setFormValues(nextValues);

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
            setFormValues((currentValues) => ({
              ...INITIAL_FORM_VALUES,
              type: currentValues.type === "signin" ? "signup" : "signin",
            }));
            setDirtyFields(INITIAL_DIRTY_FIELDS);
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
          value={formValues.username}
          onBlur={() => markFieldDirty("username")}
          onChange={handleFieldChange("username")}
          errorMessage={getFieldError("username")}
        />

        {type === "signup" && (
          <FormInputField
            name="name"
            label="名前"
            autoComplete="nickname"
            value={formValues.name}
            onBlur={() => markFieldDirty("name")}
            onChange={handleFieldChange("name")}
            errorMessage={getFieldError("name")}
          />
        )}

        <FormInputField
          name="password"
          label="パスワード"
          type="password"
          autoComplete={type === "signup" ? "new-password" : "current-password"}
          value={formValues.password}
          onBlur={() => markFieldDirty("password")}
          onChange={handleFieldChange("password")}
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

      <SubmitButton disabled={isSubmitDisabled} type={type} />

      <ModalErrorMessage>{error}</ModalErrorMessage>
    </form>
  );
};
