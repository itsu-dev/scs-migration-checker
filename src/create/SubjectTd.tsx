import React from "react";

export type SubjectProps = {
    subjectName: string,
    subjectId: string,
    isOnline: boolean ,
    season: string,
    module: string,
    week: string,
    time: number
}

const SubjectTd: React.FC<SubjectProps> = (props: SubjectProps) => {
    return (
        <td className={"subject-box"}>
            {props.season + props.module + props.week + props.time}
        </td>
    )
}

export default SubjectTd;