"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[360px] flex items-center justify-center p-6">
          <div className="max-w-md w-full rpg-panel border border-red-800/80 bg-card p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="wax-stamp text-[10px] py-0.5 px-2.5 border-red-500 text-red-400 mb-2">
              RUNTIME HAZARD DETECTED
            </div>

            <h3 className="text-base font-bold text-foreground mb-1">
              The Bureaucracy Collapsed Into a Null Void
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              A rogue bug chewed through the tavern floorboards. Your character progress is
              persisted safely in the database archives.
            </p>

            <button
              type="button"
              onClick={this.handleReload}
              className="btn-gold text-xs py-2 px-5 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Guild Hall</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
