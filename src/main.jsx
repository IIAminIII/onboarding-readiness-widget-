import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { bootstrapZoho } from "./services/zohoBootstrap.js";
import "./index.css";

// Attach the PageLoad handler before React renders so no event can be missed.
bootstrapZoho();

const container = document.getElementById("root");

function showFatal(message) {
  if (!container) return;

  container.innerHTML = "";
  const box = document.createElement("div");
  box.setAttribute("role", "alert");
  box.className = "fatal-state";
  box.innerHTML =
    "<strong>The onboarding widget could not start.</strong>" +
    "<p></p><p class='fatal-state__hint'>Open the browser console for the full error.</p>";
  box.querySelector("p").textContent = String(message || "Unknown error.");
  container.appendChild(box);
}

// A bundle-level failure would otherwise leave the widget panel empty.
window.addEventListener("error", (event) => {
  console.error("Onboarding Readiness script error:", event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("Onboarding Readiness unhandled rejection:", event.reason);
});

if (!container) {
  console.error("Onboarding Readiness: #root container is missing.");
} else {
  try {
    createRoot(container).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );
  } catch (mountError) {
    console.error("Onboarding Readiness mount error:", mountError);
    showFatal(mountError?.message);
  }
}
