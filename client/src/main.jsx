import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import useAuthStore from "./store/authStore";

const initializeApplication = async () => {
  const { fetchCurrentUser } =
    useAuthStore.getState();

  await fetchCurrentUser();
};

const startApplication = async () => {
  await initializeApplication();

  createRoot(
    document.getElementById("root")
  ).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
};

startApplication();