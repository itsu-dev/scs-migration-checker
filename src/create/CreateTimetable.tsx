import React, {useState} from "react";
import "./CreateTimetable.css"
import {getExcludedSeason, isRuleLoaded, kdb, loadKdb, loadRuleDefinitions, ruleDefinitions} from "../App";
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
let modules = new Map<string, Module>();  // 春A: Module

export let selectedDepartments: string[] = [];
export let creationType = 0; // 0: 高い志望順位の重点科目を重視, 1: 高い志望順位の応募要件を重視
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

    const initialize = (force: boolean) => {
        if (!force && modules.size !== 0) return;

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
                            time: i,
                            type: 2
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

    const initializeMenu = () => {
        seasons.forEach((season) => {
            seasonModules.forEach((seasonAlphabet) => {
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

    initialize(false);
    initializeMenu()

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

    const switchModule = (moduleKey: string) => {
        const module = modules.get(moduleKey)!!;
        module.times.forEach((time) => {
            time.subjects = [...time.subjects];
        })
        module.times = [...module.times];
        setModule(module);
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

        initialize(true);

        const departments = ruleDefinitions.departments
            .filter((department) => selectedDepartments.includes(department.departmentName));
        const kdbSubjects = Array.from(kdb.data.values());
        const kdbCache: Array<Array<string>> = [];
        const messages: string[] = [];

        departments.forEach((department) => {
            department.rules.forEach((rule) => {
                if (!["required_subjects", "important_subjects"].includes(rule.type)) return;

                rule.subjects.forEach((subject) => {
                    if (subject.startsWith("#")) return;
                    const split = subject.split("::")[0];
                    let type = "応募要件";
                    if (rule.type === "important_subject") type = "重点科目"

                    const excludedSeason = getExcludedSeason(ruleDefinitions, split);
                    if (excludedSeason !== null) {
                        messages.push(`${department.departmentName}では${subject}が${type}として設定されていますが、開講時期が${excludedSeason}のため時期を決定できません。`);
                        return;
                    }

                    let results = kdbSubjects.filter((value) => value[0] === split);
                    if (results.length == 0) {
                        results = kdbSubjects.filter((value) => value[0] === split);
                    }

                    if (results.length == 0) {
                        console.log(`Not Found: ${split}`);
                        messages.push(`${split}は科目データに存在しません。`);
                        return;
                    }

                    const kdbSubject = results[0];

                    kdbCache.push(kdbSubject);

                    let season = "";
                    const seasonsArray: string[] = [];
                    for (let i = 0; i < kdbSubject[1].length; i++) {
                        const char = kdbSubject[1].charAt(i);
                        if (seasons.includes(char)) {
                            season = char;
                        } else if (seasonModules.includes(char)) {
                            seasonsArray.push(season + char);
                        }
                    }

                    let week = "";
                    const timesArray: string[] = [];
                    kdbSubject[2].split(",").forEach((split) => {
                        if (split !== "応談") {
                            for (let i = 0; i < split.length; i++) {
                                const char = split.charAt(i);
                                if (weeks.includes(char)) {
                                    week = char;
                                } else {
                                    timesArray.push(week + char)
                                }
                            }
                        } else {
                            messages.push(`${department.departmentName}では${subject}が${type}として設定されていますが、開講時期が応談のため時期を決定できません。`);
                        }
                    });

                    seasonsArray.forEach((s) => {
                        timesArray.forEach((t) => {
                            const module = modules.get(s);
                            console.log(module);
                            if (module) {
                                module.times.forEach((timeTr) => {
                                    const subscribedSubject = timeTr.subjects.filter((subject) => (subject.week + subject.time) === t)?.[0];
                                    console.log(subscribedSubject)
                                    if (subscribedSubject) {
                                        subscribedSubject.subjectName = split;
                                        subscribedSubject.type = rule.type === "required_subjects" ? 0 : 1
                                        subscribedSubject.isOnline = kdbSubject[4].includes("オンライン");
                                    }
                                })
                            }
                        });
                    });

                    /*
                    const newModules = new Map<string, Module>();

                    Array.from(modules.keys()).forEach((key) => {
                        const module = modules.get(key)!!;
                        module.times.forEach((time) => {
                            const subjects: SubjectProps[] = [];
                            time.subjects.forEach((subject) => {
                                subjects.push({
                                    subjectName: subject.type === 0 && creationType === 0 || subject.type === 1 && creationType === 1 ?
                                })
                            })
                        })
                    })

                     */
                })
            });
        });
        console.log(messages);
        isCreating = false;
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