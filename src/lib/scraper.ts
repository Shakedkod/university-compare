import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { CoursesListByType, CourseType, type CourseData } from '../types/course';

// Create a custom axios instance with retry logic
const axiosInstance = axios.create({
    timeout: 15000,
    httpsAgent: new https.Agent({
        rejectUnauthorized: false // Ignore SSL cert issues
    })
});

// Add retry logic
axiosInstance.interceptors.response.use(undefined, async (error) => {
    const { config, message } = error;

    // Only retry on network errors or 5xx responses, up to 3 times
    if ((!error.response || error.response.status >= 500) && config.retryCount < 3) {
        config.retryCount = config.retryCount || 0;
        config.retryCount += 1;

        // Exponential backoff
        const delay = Math.pow(2, config.retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return axiosInstance(config);
    }

    return Promise.reject(error);
});

export async function scrapeCourses(url: string): Promise<CoursesListByType[]> {
    // Fetch the HTML content
    const { data } = await axiosInstance.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;he;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
        },
    });

    // Load the HTML content into cheerio
    const $ = cheerio.load(data);

    // Array to store all course data
    const allCourses: CourseData[] = [];

    let currentYear = -1;
    let currentType = CourseType.Unknown;
    const getCourseType = (text: string): CourseType => {
        if (text.includes('לימודי חובה')) return CourseType.Mandatory;
        if (text.includes('קורסי בחירה')) return CourseType.Optional;
        if (text.includes('חובת בחירה')) return CourseType.RequiredElective;
        return CourseType.Unknown;
    };

    // Process each table that matches the structure we're looking for
    $('.tabHeader, span[id*="lblEshkolType"], td:contains("שנה")').each((index, element) => {
        const text = $(element).text().trim();

        if (text.includes("שנה א")) 
            currentYear = 1;
        else if (text.includes("שנה ב"))
            currentYear = 2;
        else if (text.includes("שנה ג"))
            currentYear = 3;
        else if (text.includes("שנה ד"))
            currentYear = 4;
        else if (text.includes("שנה ה"))
            currentYear = 5;
        else if (text.includes("שנה ו"))
            currentYear = 6;
        else if (text.includes("שנה ז"))
            currentYear = 7;
        else if (text.includes("שנה ח"))
            currentYear = 8;

        const typeFromText = getCourseType(text);
        currentType = typeFromText;

        const courseTable = $(element).closest('table').nextAll('table[id*="grdCourses"]').first();
        courseTable.find('tr.gridItem, tr.gridAlternatingItem').each((rowIndex, rowElement) => {
            // Extract course details
            const courseID = $(rowElement).find('a[id$="_lblCourseNumber"]').text().trim();
            const courseLink = `https://catalog.huji.ac.il/pages/wfrCourse.aspx?faculty=1&year=${new Date().getFullYear()}&courseId=${courseID}`;

            if (courseID)
            {
                const course: CourseData = {
                    id: courseID,
                    name: $(rowElement).find('a[id$="_lblCourseName"]').text().trim(),
                    link: courseLink,
                    points: $(rowElement).find('span[id$="_lblCoursePoints"]').text().trim(),
                    semester: $(rowElement).find('span[id$="_lblCourseSemester"]').text().trim(),
                    untilYear: $(rowElement).find('span[id$="_lblCourseMaxYear"]').text().trim() || null,
                    faculty: $(rowElement).find('span[id$="_lblRelatedChug"]').text().trim() || '',
                    year: currentYear,
                    type: currentType
                };

                allCourses.push(course);
            }
        });
    });

    // Group courses by year and type
    const groupedCourses: CoursesListByType[] = [];
    allCourses.forEach(course => {
        if (!groupedCourses[course.year - 1]) {
            groupedCourses[course.year - 1] = {
                [CourseType.Mandatory]: [],
                [CourseType.Optional]: [],
                [CourseType.RequiredElective]: [],
                [CourseType.Unknown]: []
            };
        }
        groupedCourses[course.year - 1][course.type].push(course);
    });

    return groupedCourses;
}