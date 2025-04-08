'use client';

import { useEffect, useState } from 'react';
import CourseTable from './CourseTable';
import { CoursesListByType, CourseType } from '@/types/course';
import { FacultyData, PathData } from '@/types/faculty';
import LoadingSpinner from './LoadingSpinner';

export default function WebScraper() {
    const [faculties, setFaculties] = useState<FacultyData[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState<FacultyData | null>(null);
    const [facultiesLoading, setFacultiesLoading] = useState<boolean>(false);
    const [selectedPath, setSelectedPath] = useState<PathData | null>(null);
    const [courses, setCourses] = useState<CoursesListByType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Load faculties on mount
    useEffect(() => {
        const loadFaculties = async () => {
            setFacultiesLoading(true);
            try {
                const res = await fetch('/api/faculties?start=100&end=999', {});
                const data = await res.json();
                setFaculties(data.facultiesData);
                setFacultiesLoading(false);
            } 
            catch (err) {
                setError('Failed to load faculties');
                setFacultiesLoading(false);
            }
        };
        loadFaculties();
    }, []);

    const fetchData = async () => {
        if (!selectedFaculty || !selectedPath) {
            console.log('Fetching data for URL: ERROR');
            setError('Please select a faculty and a study path');
            return;
        }
        console.log('Fetching data for URL:', selectedPath.url);

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: selectedPath.url }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to fetch data');
            setCourses(data.courses);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-row justify-center items-center">
                <img src="/logo.png" alt="Logo" className="h-20 w-20" />
                <h1 className="text-3xl font-bold text-center text-black">Get Course Information</h1>
            </div>
            <p className="text-center text-gray-700 mb-8">Currently works only for HUJI(Hebrew University of Jerusalem, Israel)</p>

            <div className="max-w-2xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label className="block font-medium mb-1 text-black">Select Faculty</label>
                    {facultiesLoading ? (<LoadingSpinner/>) : (<select
                        className="w-full border px-3 py-2 rounded text-black"
                        value={selectedFaculty?.id || ''}
                        onChange={(e) => {
                            const fac = faculties.find(f => f.id === parseInt(e.target.value));
                            setSelectedFaculty(fac || null);
                            setSelectedPath(null); // reset path
                        }}
                    >
                        <option value="">-- Choose Faculty --</option>
                        {faculties.length > 0 ? faculties.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        )) : (
                            <option value="">No faculties available</option>
                        )}
                    </select>)}
                </div>

                {selectedFaculty && (
                    <div>
                        <label className="block font-medium mb-1 text-black">Select Study Path</label>
                        <select
                            className="w-full border px-3 py-2 rounded text-black"
                            value={selectedPath?.id || ''}
                            onChange={(e) => {
                                const path = selectedFaculty.programs.find(p => p.id === e.target.value);
                                setSelectedPath(path || null);
                                console.log(path?.name);
                            }}
                        >
                            <option value="">-- Choose Path --</option>
                            {selectedFaculty.programs.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    onClick={fetchData}
                    disabled={loading || !selectedPath}
                    className="w-full py-2 px-4 rounded-md text-white font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
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