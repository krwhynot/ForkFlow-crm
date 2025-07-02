import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
        console.error('🚨 Enhanced error details:', {
            errorMessage: error.message,
            errorName: error.name,
            errorStack: error.stack,
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ForkFlow CRM ErrorBoundary',
            timestamp: new Date().toISOString()
        });
        
        // Check if this is an authentication-related error
        if (error.message?.includes('checkAuth') || error.message?.includes('auth') || error.message?.includes('login')) {
            console.error('🔐 This appears to be an AUTHENTICATION-related error!');
            console.error('🔐 This might explain why login page is not showing');
        }
        
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    fontFamily: 'Roboto, sans-serif',
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: '#fff',
                    minHeight: '100vh'
                }}>
                    <div style={{
                        background: '#ffebee',
                        border: '1px solid #f44336',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}>
                        <h1 style={{ color: '#d32f2f', margin: '0 0 16px 0' }}>
                            🚨 ForkFlow CRM Error
                        </h1>
                        <p style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
                            Something went wrong while loading the application.
                        </p>
                        <details style={{ fontSize: '14px', color: '#666' }}>
                            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                                Show technical details
                            </summary>
                            <pre style={{ 
                                background: '#f5f5f5', 
                                padding: '12px', 
                                borderRadius: '4px',
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {this.state.error?.message}
                                {this.state.error?.stack}
                            </pre>
                        </details>
                    </div>
                    
                    <div style={{
                        background: '#e3f2fd',
                        border: '1px solid #2196f3',
                        borderRadius: '8px',
                        padding: '20px'
                    }}>
                        <h2 style={{ color: '#1976d2', margin: '0 0 16px 0' }}>
                            🔧 Troubleshooting Steps
                        </h2>
                        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                            <li>
                                <strong>Refresh the page</strong> - Sometimes a simple refresh fixes the issue
                            </li>
                            <li>
                                <strong>Clear browser data</strong> - Clear localStorage and sessionStorage:
                                <br />
                                <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
                                    Open DevTools → Application → Storage → Clear Site Data
                                </code>
                            </li>
                            <li>
                                <strong>Check environment</strong> - Ensure <code>.env</code> file has correct settings:
                                <br />
                                <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
                                    VITE_IS_DEMO=true
                                </code>
                            </li>
                            <li>
                                <strong>Switch modes</strong> - Try adding <code>?mode=demo</code> to the URL
                            </li>
                        </ol>
                        
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={() => window.location.reload()}
                                style={{
                                    background: '#2196f3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    marginRight: '12px'
                                }}
                            >
                                🔄 Refresh Page
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                    window.location.reload();
                                }}
                                style={{
                                    background: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                🗑️ Clear Data & Refresh
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}