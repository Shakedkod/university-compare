import { CourseData } from '@/types/course';
import Link from 'next/link';

interface CourseTableProps {
    courses: CourseData[];
}

export default function CourseTable({ courses }: CourseTableProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-b-md shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">שיוך לחוג</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">עד שנה</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">סמסטר</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">נקודות זכות</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">שם הקורס</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course, index) => {
                        var untilYear = course.untilYear;
                        if (untilYear === null)
                            untilYear = '~';

                        return (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                <td className="px-4 py-2 whitespace-nowrap">{course.faculty}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{untilYear}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{course.semester}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{course.points}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {course.link.trim().length > 0 ? (
                                        <Link href={course.link} target="_blank" className="text-orange-500 hover:underline">
                                            {course.name}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-500">{course.name}</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">{course.id}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}