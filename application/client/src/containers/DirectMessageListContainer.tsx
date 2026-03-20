import { useId } from "react";
import { Helmet } from "react-helmet";

import { AuthPendingPage } from "@web-speed-hackathon-2026/client/src/components/application/AuthPendingPage";
import { DirectMessageGate } from "@web-speed-hackathon-2026/client/src/components/direct_message/DirectMessageGate";
import { DirectMessageListPage } from "@web-speed-hackathon-2026/client/src/components/direct_message/DirectMessageListPage";
import { NewDirectMessageModalContainer } from "@web-speed-hackathon-2026/client/src/containers/NewDirectMessageModalContainer";

interface Props {
  activeUser: Models.User | null;
  isLoadingActiveUser: boolean;
  authModalId: string;
}

export const DirectMessageListContainer = ({
  activeUser,
  isLoadingActiveUser,
  authModalId,
}: Props) => {
  const newDmModalId = useId();

  if (isLoadingActiveUser) {
    return <AuthPendingPage title="ダイレクトメッセージ" message="サインイン状態を確認しています。" />;
  }

  if (activeUser === null) {
    return (
      <DirectMessageGate
        headline="DMを利用するにはサインインが必要です"
        authModalId={authModalId}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>ダイレクトメッセージ - CaX</title>
      </Helmet>
      <DirectMessageListPage activeUser={activeUser} newDmModalId={newDmModalId} />
      <NewDirectMessageModalContainer id={newDmModalId} />
    </>
  );
};
