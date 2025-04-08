export interface PathData
{
    id: string;
    name: string;
    url: string;
}

export interface FacultyData 
{
    id: number;
    name: string;
    url: string;
    programs: PathData[];
}

export function convertJsonToFaculty(json: any): FacultyData 
{
    return {
        id: json.id,
        name: json.name,
        url: json.url,
        programs: json.programs.map((program: any) => convertJsonToPath(program)),
    };
}

export function convertJsonToPath(json: any): PathData 
{
    return {
        id: json.id,
        name: json.name,
        url: json.url,
    };
}