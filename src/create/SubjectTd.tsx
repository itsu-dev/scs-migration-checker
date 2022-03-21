import React from "react";
import "./SubjectTd.css";

export type SubjectProps = {
    subjectName: string,
    subjectId: string,
    isOnline: boolean,
    season: string,
    module: string,
    week: string,
    time: number,
    type: number, // 0: 応募要件, 1: 重点科目, 2: ユーザー指定
    department: string,
    relatedModules: string[],
    relatedTimes: string[],
    kdbData: Array<string>,
    onclick: (props: SubjectProps) => void,
}

const SubjectTd: React.FC<SubjectProps> = (props: SubjectProps) => {
    return (
        <td className={`subject-box ${props.isOnline && "online"}`} onClick={() => {
            props.onclick(props)
        }}>
            {props.subjectName}
        </td>
    )
}

export default SubjectTd;