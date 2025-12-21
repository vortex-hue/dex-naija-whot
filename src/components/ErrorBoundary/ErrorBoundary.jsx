import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="error-boundary-container">
                    <div className="error-content">
                        <h1>⚠️ Something went wrong ⚠️</h1>
                        <p>We are sorry, but an unexpected error has occurred.</p>
                        <details className="error-details">
                            <summary>Click for error details</summary>
                            <pre>{this.state.error && this.state.error.toString()}</pre>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </details>
                        <div className="error-actions">
                            <button onClick={() => window.location.reload()} className="retry-btn">
                                Reload Game
                            </button>
                            <button onClick={() => window.location.href = '/tournaments'} className="home-btn">
                                Return to Lobby
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
