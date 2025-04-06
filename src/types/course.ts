export enum CourseType 
{
    Mandatory, Optional, RequiredElective, Unknown
};

export interface CourseData 
{
    id: string;
    name: string;
    link: string;
    points: string;
    untilYear: string | null;
    semester: string;
    faculty: string;
    year: number;
    type: CourseType;
}

// The courses list is a list of dictionaries where the key is the type and the value is an array of courses
// The list is indexed by year
export interface CoursesListByType
{
    [CourseType.Mandatory]: CourseData[];
    [CourseType.Optional]: CourseData[];
    [CourseType.RequiredElective]: CourseData[];
    [CourseType.Unknown]: CourseData[];
};
