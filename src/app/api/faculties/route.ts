import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { FacultyData, convertJsonToFaculty } from "@/types/faculty";

export async function GET(req: NextRequest) 
{
    try
    {
        const facultiesUrl = "https://raw.githubusercontent.com/Shakedkod/FacultiesFinding/refs/heads/main/data/faculty-data.json";

        const sourceData = await axios.get(facultiesUrl).then((res) => res.data);

        const facultiesData: FacultyData[] = sourceData.map((faculty: any) => convertJsonToFaculty(faculty));

        return NextResponse.json({ facultiesData });
    }
    catch (error) 
    {
        console.error("Error fetching faculties data:", error);
        return NextResponse.json({ error: "Failed to fetch faculties data" }, { status: 500 });
    }
}