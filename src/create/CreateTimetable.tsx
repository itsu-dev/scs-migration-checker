import React, {useState} from "react";
import "./CreateTimetable.css"
import {isRuleLoaded, loadKdb, loadRuleDefinitions, ruleDefinitions} from "../App";
import TimeTr, {TimeProps} from "./TimeTr";
import {SubjectProps} from "./SubjectTd";
import MenuBar, {MenuItem} from "../MenuBar";
import StepOne from "./StepOne";

type Module = {
    season: string,
    module: string,
    times: TimeProps[]
}

const seasons = ["春", "秋"];
const seasonModules = ["A", "B", "C"];
const weeks = ["月", "火", "水", "木", "金"];
const modules = new Map<string, Module>();

let selectedDepartments: string[] = [];
let isCreating = false;

export const selectDepartment = (department: string) => {
    if (selectedDepartments.includes(department)) {
        selectedDepartments = selectedDepartments.filter((value) => value !== department);
    } else {
        selectedDepartments.push(department);
    }
}

const CreateTimetable: React.FC = () => {
    const menuItems: MenuItem[] = [];

    const initialize = () => {
        seasons.forEach((season) => {
            seasonModules.forEach((seasonAlphabet) => {
                const times: TimeProps[] = [];

                for (let i = 1; i <= 6; i++) {
                    const subjects: SubjectProps[] = [];
                    weeks.forEach((week) => {
                        subjects.push({
                            subjectName: "",
                            subjectId: "",
                            isOnline: false,
                            season: season,
                            module: seasonAlphabet,
                            week: week,
                            time: i
                        })
                    })

                    times.push({
                        time: i,
                        subjects: subjects
                    })
                }

                modules.set(`${season}${seasonAlphabet}`, {
                    season: season,
                    module: seasonAlphabet,
                    times: times
                })

                menuItems.push({
                    text: season + seasonAlphabet,
                    selectedCondition: (text: string) => {
                        return text === module.season + module.module;
                    },
                    onClick: () => {
                        switchModule(season + seasonAlphabet);
                    }
                })
            })
        })
    }

    initialize();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [module, setModule] = useState<Module>(modules.get("春A")!!);
    const [step, setStep] = useState<number>(1);

    window.onload = () => {
        setLoading(true);
        loadRuleDefinitions(() => {
            loadKdb(() => {
                setLoading(false);
            })
        });
    }

    const switchModule = (module: string) => {
        setModule(modules.get(module)!!);
    }

    const startToCreate = () => {
        if (selectedDepartments.length == 0) {
            alert("1つ以上の学類・学群を選択してください。");
            return;
        }

        if (isCreating) {
            alert("作成中です。しばらくお待ちください。");
            return;
        }

        isCreating = true;

        const departments = ruleDefinitions.departments
            .filter((department) => selectedDepartments.includes(department.departmentName));
    }

    const stepMenuItems: MenuItem[] = [];
    stepMenuItems.push({
        text: "ステップ1",
        selectedCondition: (text => text === `ステップ${step}`),
        onClick: () => {
            setStep(1);
        }
    })

    stepMenuItems.push({
        text: "ステップ2",
        selectedCondition: (text => text === `ステップ${step}`),
        onClick: () => {
            setStep(2);
        }
    })

    return (
        <>
            <div className={"timetable-base"}>
                <div className={"timetable-box"}>
                    <MenuBar menuItems={menuItems}/>
                    <table>
                        <tbody>
                        <tr>
                            <th className={"time"}/>
                            <th>月</th>
                            <th>火</th>
                            <th>水</th>
                            <th>木</th>
                            <th>金</th>
                        </tr>
                        {module.times.map((time, index) =>
                            <TimeTr
                                key={index}
                                time={time.time}
                                subjects={time.subjects}/>
                        )}
                        </tbody>
                    </table>
                </div>
                <div className={"contents-box"}>
                    {isLoading && <p id={"loading-text"}>読み込み中...</p>}

                    {!isLoading &&
                        <>
                            <MenuBar menuItems={stepMenuItems}/>
                            {step === 1 && <StepOne startToCreate={startToCreate}/>}
                        </>
                    }
                </div>
            </div>
        </>
    )
}

export default CreateTimetable;