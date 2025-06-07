import { createRoot } from "react-dom/client";
import App from "./App";
// Import our main CSS LAST to ensure highest priority
import "./index.css";

// Add a style tag to force our CSS to load with maximum priority
const forceStylePriority = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Force our purple theme over any library styles */
    * {
      --force-purple: rgb(124, 58, 237) !important;
    }
  `;
  document.head.appendChild(style);
};

// Execute immediately
forceStylePriority();

createRoot(document.getElementById("root")!).render(<App />);
