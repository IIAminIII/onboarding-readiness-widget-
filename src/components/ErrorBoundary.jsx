import { Component } from "react";
import { ErrorState } from "./WidgetState.jsx";

/**
 * Without this, a render error unmounts the whole tree and the widget panel
 * goes blank with no explanation.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { message: "" };
  }

  static getDerivedStateFromError(error) {
    return { message: error?.message || "Unexpected widget error." };
  }

  componentDidCatch(error, info) {
    console.error("Onboarding Readiness render error:", error, info);
  }

  render() {
    if (this.state.message) {
      return <ErrorState message={this.state.message} />;
    }

    return this.props.children;
  }
}
