import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";
import { NewDirectMessageFormData } from "@web-speed-hackathon-2026/client/src/direct_message/types";
import { validate } from "@web-speed-hackathon-2026/client/src/direct_message/validation";

interface Props {
  id: string;
  onSubmit: (values: NewDirectMessageFormData) => Promise<string | null>;
}

const SubmitButton = ({ disabled }: { disabled: boolean }) => {
  const { pending } = useFormStatus();

  return (
    <ModalSubmitButton disabled={disabled || pending} loading={pending}>
      DMを開始
    </ModalSubmitButton>
  );
};

export const NewDirectMessageModalPage = ({ id, onSubmit }: Props) => {
  const [username, setUsername] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validationErrors = validate({ username });
  const usernameError = isDirty ? validationErrors.username : undefined;
  const isInvalid = Object.keys(validationErrors).length > 0;

  const handleAction = async (formData: FormData) => {
    const nextUsername = String(formData.get("username") ?? "");
    const nextValidationErrors = validate({ username: nextUsername });

    setIsDirty(true);

    if (Object.keys(nextValidationErrors).length > 0) {
      setError(null);
      return;
    }

    const nextError = await onSubmit({ username: nextUsername });
    setError(nextError);
  };

  return (
    <div className="grid gap-y-6">
      <h2 className="text-center text-2xl font-bold">新しくDMを始める</h2>

      <form action={handleAction} className="flex flex-col gap-y-6">
        <FormInputField
          name="username"
          label="ユーザー名"
          placeholder="username"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setIsDirty(true);
            setError(null);
          }}
          onBlur={() => {
            setIsDirty(true);
          }}
          errorMessage={usernameError}
        />

        <div className="grid gap-y-2">
          <SubmitButton disabled={isInvalid} />
          <Button variant="secondary" command="close" commandfor={id}>
            キャンセル
          </Button>
        </div>

        <ModalErrorMessage>{error}</ModalErrorMessage>
      </form>
    </div>
  );
};
