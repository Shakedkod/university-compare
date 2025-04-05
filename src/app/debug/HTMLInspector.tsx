'use client';

import { useState } from 'react';

export default function HTMLInspector() {
    const [url, setUrl] = useState<string>('');
    const [htmlSample, setHtmlSample] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHtml = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/debug', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch HTML');
            }

            setHtmlSample(data.htmlSample);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch HTML');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">HTML Structure Inspector</h1>

            <div className="max-w-2xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="debug-url" className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                    </label>
                    <input
                        type="text"
                        id="debug-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/course/521"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={fetchHtml}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {loading ? 'Fetching...' : 'Inspect HTML'}
                </button>
            </div>

            {error && (
                <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            {htmlSample && (
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold mb-3">HTML Structure Sample</h2>
                    <div className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm">
                            {htmlSample}
                        </pre>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                        Use this sample to identify the CSS selectors you need for scraping the website.
                        Look for table structures, class names, and element hierarchies.
                    </p>
                </div>
            )}
        </div>
    );
}