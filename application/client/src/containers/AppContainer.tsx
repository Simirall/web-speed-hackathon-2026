import { lazy, Suspense, useCallback, useEffect, useId, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet";
import { Route, Routes, useLocation, useNavigate } from "react-router";

import { AppPage } from "@web-speed-hackathon-2026/client/src/components/application/AppPage";
import { AuthModalContainer } from "@web-speed-hackathon-2026/client/src/containers/AuthModalContainer";
import { PostContainer } from "@web-speed-hackathon-2026/client/src/containers/PostContainer";
import { TimelineContainer } from "@web-speed-hackathon-2026/client/src/containers/TimelineContainer";
import { sendJSON } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

const DirectMessageListContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/DirectMessageListContainer").then(
    ({ DirectMessageListContainer }) => ({ default: DirectMessageListContainer }),
  ),
);

const DirectMessageContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/DirectMessageContainer").then(
    ({ DirectMessageContainer }) => ({ default: DirectMessageContainer }),
  ),
);

const SearchContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/SearchContainer").then(
    ({ SearchContainer }) => ({ default: SearchContainer }),
  ),
);

const UserProfileContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/UserProfileContainer").then(
    ({ UserProfileContainer }) => ({ default: UserProfileContainer }),
  ),
);

const TermContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/TermContainer").then(
    ({ TermContainer }) => ({ default: TermContainer }),
  ),
);

const CrokContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/CrokContainer").then(
    ({ CrokContainer }) => ({ default: CrokContainer }),
  ),
);

const NotFoundContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/NotFoundContainer").then(
    ({ NotFoundContainer }) => ({ default: NotFoundContainer }),
  ),
);

const NewPostModalContainer = lazy(() =>
  import("@web-speed-hackathon-2026/client/src/containers/NewPostModalContainer").then(
    ({ NewPostModalContainer }) => ({ default: NewPostModalContainer }),
  ),
);

async function fetchActiveUser(): Promise<Models.User | null> {
  const response = await fetch("/api/v1/me");
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json() as Promise<Models.User>;
}

export const AppContainer = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const [activeUser, setActiveUser] = useState<Models.User | null>(null);
  const [isLoadingActiveUser, setIsLoadingActiveUser] = useState(true);

  useEffect(() => {
    void fetchActiveUser()
      .then((user) => {
        setActiveUser(user);
      })
      .catch(() => {
        setActiveUser(null);
      })
      .finally(() => {
        setIsLoadingActiveUser(false);
      });
  }, []);

  const handleLogout = useCallback(async () => {
    await sendJSON("/api/v1/signout", {});
    setActiveUser(null);
    navigate("/");
  }, [navigate]);

  const authModalId = useId();
  const newPostModalId = useId();

  return (
    <HelmetProvider>
      <Helmet>
        <title>CaX</title>
      </Helmet>
      <AppPage
        activeUser={activeUser}
        isLoadingActiveUser={isLoadingActiveUser}
        authModalId={authModalId}
        newPostModalId={newPostModalId}
        onLogout={handleLogout}
      >
        <Suspense
          fallback={
            <div className="text-cax-text-subtle grid min-h-32 place-items-center text-sm">
              読み込み中...
            </div>
          }
        >
          <Routes>
            <Route element={<TimelineContainer />} path="/" />
            <Route
              element={
                <DirectMessageListContainer
                  activeUser={activeUser}
                  isLoadingActiveUser={isLoadingActiveUser}
                  authModalId={authModalId}
                />
              }
              path="/dm"
            />
            <Route
              element={
                <DirectMessageContainer
                  activeUser={activeUser}
                  isLoadingActiveUser={isLoadingActiveUser}
                  authModalId={authModalId}
                />
              }
              path="/dm/:conversationId"
            />
            <Route element={<SearchContainer />} path="/search" />
            <Route element={<UserProfileContainer />} path="/users/:username" />
            <Route element={<PostContainer />} path="/posts/:postId" />
            <Route element={<TermContainer />} path="/terms" />
            <Route
              element={
                <CrokContainer
                  activeUser={activeUser}
                  isLoadingActiveUser={isLoadingActiveUser}
                  authModalId={authModalId}
                />
              }
              path="/crok"
            />
            <Route element={<NotFoundContainer />} path="*" />
          </Routes>
        </Suspense>
      </AppPage>

      <AuthModalContainer id={authModalId} onUpdateActiveUser={setActiveUser} />
      <Suspense fallback={null}>
        <NewPostModalContainer id={newPostModalId} />
      </Suspense>
    </HelmetProvider>
  );
};
