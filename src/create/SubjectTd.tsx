import React from "react";

export type SubjectProps = {
    subjectName: string,
    subjectId: string,
    isOnline: boolean ,
    season: string,
    module: string,
    week: string,
    time: number,
    type: number, // 0: 応募要件, 1: 重点科目, 2: ユーザー指定
    relatedModules: string[],
    relatedTimes: string[]
}

const SubjectTd: React.FC<SubjectProps> = (props: SubjectProps) => {
    return (
        <td className={"subject-box"}>
            {props.subjectName}
        </td>
    )
}

export default SubjectTd;