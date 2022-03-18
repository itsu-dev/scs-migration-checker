import React from "react";

export type SubjectsProps = {
    sum: number,
    text: string,
    hidden: boolean
}

const SubjectBox: React.FC<SubjectsProps> = (props: SubjectsProps) => {
    return (
        <div>
            <h3>検出された科目</h3>
            <p>合計{props.sum}単位：{props.text}</p>
        </div>
    )
}

export default SubjectBox;