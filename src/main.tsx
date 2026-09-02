import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-6 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#6C63FF]/20 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              ⚠
            </div>
            <h2 className="text-xl font-bold text-[#2D2D3F] mb-2">Something went wrong</h2>
            <p className="text-xs text-[#7B7A92] mb-6 leading-relaxed">
              We encountered a temporary issue. Click below to reload cleanly.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-[#6C63FF] text-white font-bold rounded-xl text-sm hover:bg-[#5b52e0] transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);