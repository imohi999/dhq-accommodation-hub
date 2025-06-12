
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("main.tsx executing");

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = "<div style='padding: 20px; font-family: Arial;'><h1>Error: Root element not found</h1><p>The HTML file is missing a div with id='root'</p></div>";
} else {
  try {
    console.log("Creating React root");
    const root = createRoot(rootElement);
    console.log("Rendering App component");
    root.render(<App />);
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    rootElement.innerHTML = "<div style='padding: 20px; font-family: Arial;'><h1>Error rendering app</h1><pre>" + String(error) + "</pre></div>";
  }
}
