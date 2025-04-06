'use client';

import { useState } from 'react';
import CourseTable from './CourseTable';
import { CoursesListByType, CourseType } from '@/types/course';

export default function WebScraper() {
    const [courses, setCourses] = useState<CoursesListByType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState<string>('');

    const fetchData = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch data');
            }

            setCourses(data.courses);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Course Information Scraper</h1>

            <div className="max-w-2xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                    </label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/course/521"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    {loading ? 'Fetching...' : 'Fetch Course Data'}
                </button>
            </div>

            {error && (
                <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            {courses.map((year, index) => {
                const mandatoryCourses = year[CourseType.Mandatory] || [];
                const requiredElectiveCourses = year[CourseType.RequiredElective] || [];
                const electiveCourses = year[CourseType.Optional] || [];

                return (
                    <div key={index} className="mb-8">
                        <h2 className="text-xl font-semibold mb-3 bg-orange-400 text-white py-2 px-4 rounded-t-md text-right">
                            שנת לימודים {year[0][0].year}
                        </h2>
                        {mandatoryCourses.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2 text-center">חובה</h3>
                                <CourseTable courses={mandatoryCourses} />
                            </div>
                        )}
                        {requiredElectiveCourses.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2 text-center">חובת בחירה</h3>
                                <CourseTable courses={requiredElectiveCourses} />
                            </div>
                        )}
                        {electiveCourses.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2 text-center">בחירה</h3>
                                <CourseTable courses={electiveCourses} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}