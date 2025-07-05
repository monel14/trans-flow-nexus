
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Main.tsx: Starting application...');
console.log('🚀 Main.tsx: DOM element found:', document.getElementById("root"));

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Main.tsx: Root element not found!');
} else {
  console.log('✅ Main.tsx: Root element found, creating React root...');
  const root = createRoot(rootElement);
  console.log('✅ Main.tsx: React root created, rendering App...');
  root.render(<App />);
  console.log('✅ Main.tsx: App rendered successfully');
}
