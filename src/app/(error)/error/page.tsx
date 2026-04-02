'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GlobalErrorPage() {
    const router = useRouter();

    const handleBack = () => {
        window.location.replace('/organization/main-dashboard');
    };

    useEffect(() => {
        history.pushState(null, '', '/error');
        window.onpopstate = () => {
            history.pushState(null, '', '/error');
        };
    }, []);

    return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-white text-center p-6">
            {/* Security Icon (Optional but recommended) */}
            <div className="mb-6 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Security Violation Detected</h1>

            <p className="text-lg text-gray-600 mb-2">
                The URL you are trying to access is invalid or has been tampered with.
            </p>

            <p className="text-sm text-gray-500 mb-8 max-w-md">
                For security reasons, your current session for this page has been terminated.
                Please return to the dashboard and try again.
            </p>
{/* 
            <button
                onClick={handleBack}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 uppercase tracking-wider text-sm"
            >
                Back to Dashboard
            </button> */}
        </div>
    );
}