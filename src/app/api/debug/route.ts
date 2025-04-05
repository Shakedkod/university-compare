import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        // Parse the JSON body from the request
        const body = await request.json();
        const { url } = body;

        // Validate URL
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
        }

        // Fetch the HTML content
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        // Return just a sample of the HTML (it could be too large otherwise)
        const htmlSample = data.substring(0, 10000) + '...';

        return NextResponse.json({
            htmlSample,
            message: 'This is a truncated sample of the HTML. Use this to identify the correct CSS selectors for scraping.'
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json({
            error: 'Failed to fetch website HTML',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}