import MenuBar from "../MenuBar";
import {isRuleLoaded, ruleDefinitions} from "../App";
import React from "react";
import {selectDepartment} from "./CreateTimetable";

type StepOneProps = {
    startToCreate: () => void
}

const StepOne: React.FC<StepOneProps> = (props: StepOneProps) => {
    return (
        <>
            <h3>1. 希望する学類・学群を選ぶ</h3>
            <div className={"departments-box section"}>
                {isRuleLoaded && ruleDefinitions.departments.map((department, index) =>
                    <div key={index} className={"department-checkbox"}>
                        <input type={"checkbox"} id={`department_${index}`}
                               value={department.departmentName} onChange={(e) => {selectDepartment(department.departmentName)}}/>
                        <label htmlFor={`department_${index}`}>{department.departmentName}</label>
                    </div>
                )}
            </div>

            <div className={"section"}>
                <h3>2. 時間割を生成する</h3>
                <p>以下のボタンを押すと、希望した学類・学群の応募要件と重点科目を取るような時間割が自動生成されます。</p>
                <button className={"primary-button"} onClick={props.startToCreate}>時間割を生成する</button>
            </div>

            <div className={"section"}>
                <h3>3. 時間割を編集する</h3>
                <p>ステップ2に進み、履修をカスタマイズしてください。</p>
            </div>
        </>
    )
}

export default StepOne;