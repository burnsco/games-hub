import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Game crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-8 text-center">
          <div className="text-7xl">💥</div>
          <h1 className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-4xl font-black text-transparent">
            Game Crashed
          </h1>
          <p className="max-w-sm text-slate-400">
            Something went wrong. Try going back and launching the game again.
          </p>
          <p className="max-w-sm font-mono text-xs text-slate-600">{this.state.error.message}</p>
          <Link
            to="/"
            onClick={() => this.setState({ error: null })}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Back to Games
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
