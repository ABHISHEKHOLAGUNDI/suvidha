import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n';
import App from './App.tsx'
import { SocketProvider } from './context/SocketContext';
import './services/dbReset'; // Database reset utility

console.log("Main.tsx: Imports done. Mounting App...");

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null, errorInfo: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#fff', color: 'red', overflow: 'auto', maxHeight: '100vh' }}>
          <h1 style={{ fontSize: 32, marginBottom: 20 }}>Critical Application Error</h1>
          <p style={{ fontSize: 18, fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
          <pre style={{ background: '#eee', padding: 20, borderRadius: 10, marginTop: 20 }}>
            {this.state.error?.stack}
          </pre>
          <pre style={{ background: '#eee', padding: 20, borderRadius: 10, marginTop: 20 }}>
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}
