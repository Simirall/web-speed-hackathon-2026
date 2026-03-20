// CSS エントリポイント
import "./index.css";

// ビルド情報
import "./buildinfo";

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppContainer } from "@web-speed-hackathon-2026/client/src/containers/AppContainer";

window.addEventListener("load", () => {
  createRoot(document.getElementById("app")!).render(
    <BrowserRouter>
      <AppContainer />
    </BrowserRouter>,
  );
});
