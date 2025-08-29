import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

async function enableMocking() {
  const hasApiUrl =
    typeof import.meta.env.VITE_API_URL === "string" &&
    import.meta.env.VITE_API_URL.trim().length > 0;

  if (import.meta.env.DEV && !hasApiUrl) {
    console.log("[MSW] Starting because VITE_API_URL is missing in DEV.");
    const { worker } = await import("./mocks/browser");
    await worker.start();
  }
}


enableMocking().then(() => {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    throw new Error("Root element (#root) not found");
  }

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
});
