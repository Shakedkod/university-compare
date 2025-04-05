import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import type { CourseData } from '../types/course';

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

export async function scrapeCourses(url: string): Promise<CourseData[]> {
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

    // Process each table that matches the structure we're looking for
    $('table').each((tableIndex, tableElement) => {
        // Skip tables that don't have enough columns
        if ($(tableElement).find('tr:first-child td, tr:first-child th').length < 5) return;

        // Process each row in the table
        $(tableElement).find('tr:not(:first-child)').each((rowIndex, rowElement) => {
            const columns = $(rowElement).find('td');

            // Make sure we have enough columns
            if (columns.length < 5) return;

            // Extract data from columns - adjust indices to match the actual HTML structure
            var faculty = "", untilYear = null;
            if (columns.length == 5)
                faculty = $(columns.eq(4)).text().trim();
            else if (columns.length == 6) {
                faculty = $(columns.eq(5)).text().trim();
                untilYear = $(columns.eq(4)).text().trim();
            }
            else if (columns.length == 7) {
                faculty = $(columns.eq(6)).text().trim();
                untilYear = $(columns.eq(4)).text().trim();
            }

            const course: CourseData = {
                id: $(columns.eq(0)).text().trim(),
                name: $(columns.eq(1)).text().trim(),
                points: $(columns.eq(2)).text().trim(),
                semester: $(columns.eq(3)).text().trim(),
                untilYear: untilYear,
                faculty: faculty,
            };

            // Only add valid courses (with an ID)
            if (course.id) {
                allCourses.push(course);
            }
        });
    });

    return allCourses;
}