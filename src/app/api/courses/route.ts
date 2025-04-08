import { NextRequest, NextResponse } from 'next/server';
import { scrapeCourses } from '@/lib/scraper';

export async function POST(request: NextRequest) {
    try {
        // Parse the JSON body from the request
        const body = await request.json();
        const { url } = body;

        // Validate URL
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
        }

        // Use the scraper service
        const courses = await scrapeCourses(url);

        return NextResponse.json({ courses });
    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({
            error: 'Failed to scrape the website',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}