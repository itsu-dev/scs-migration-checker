import React from "react";
import SubjectCell, {SubjectCellProps} from "./SubjectCell";

export type TimeProps = {
    time: number,
    subjects: SubjectCellProps[]
}

const TimeTr: React.FC<TimeProps> = (props: TimeProps) => {
    return (
        <tr>
            <td className={"time"}>{props.time}</td>
            {props.subjects.map((subject, index) =>
                <SubjectCell
                    key={index}
                    season={subject.season}
                    module={subject.module}
                    week={subject.week}
                    time={subject.time}
                    type={subject.type}
                    isOnline={subject.isOnline}
                    kdb={subject.kdb}
                    onclick={subject.onclick} />
            )}
        </tr>
    )
}

export default TimeTr;