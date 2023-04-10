export type SubjectId = string;
export type SubjectName = string;
export type SubjectOpeningModule = string;  // 春BCなど
export type SubjectOpeningDay = string;  // 金1など
export type SubjectPlace = string;
export type SubjectDescription = string;
export type SubjectUnit = string;

export type KdBItem = [SubjectName, SubjectOpeningModule, SubjectOpeningDay, SubjectPlace, SubjectDescription, SubjectUnit];

export type KdBData = {[key: SubjectId]: KdBItem}