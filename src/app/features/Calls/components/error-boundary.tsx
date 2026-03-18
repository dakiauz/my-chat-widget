'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../components/ui/button';
import { IconRefresh, IconBug } from '@tabler/icons-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to an error reporting service
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <IconBug className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-center text-gray-800">Something went wrong</h2>
                        <p className="mb-4 text-sm text-center text-gray-600">The application encountered an unexpected error. Please try again.</p>
                        <div className="p-3 mb-4 overflow-auto text-xs bg-gray-100 rounded max-h-40">
                            <pre className="text-red-600">{this.state.error?.toString()}</pre>
                            {this.state.errorInfo && <pre className="mt-2 text-gray-700">{this.state.errorInfo.componentStack}</pre>}
                        </div>
                        <div className="flex justify-center">
                            <Button onClick={this.handleReset} className="flex items-center gap-2">
                                <IconRefresh className="w-4 h-4" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
