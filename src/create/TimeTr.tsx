import React from "react";
import SubjectTd, {SubjectProps} from "./SubjectTd";

export type TimeProps = {
    time: number,
    subjects: SubjectProps[]
}

const TimeTr: React.FC<TimeProps> = (props: TimeProps) => {
    return (
        <tr>
            <td className={"time"}>{props.time}</td>
            {props.subjects.map((subject, index) =>
                <SubjectTd
                    key={index}
                    subjectName={subject.subjectName}
                    subjectId={subject.subjectId}
                    isOnline={subject.isOnline}
                    season={subject.season}
                    module={subject.module}
                    week={subject.week}
                    time={subject.time}
                    type={subject.type}
                    department={subject.department}
                    relatedModules={subject.relatedModules}
                    relatedTimes={subject.relatedTimes}
                    kdbData={subject.kdbData}
                    onclick={subject.onclick} />
            )}
        </tr>
    )
}

export default TimeTr;