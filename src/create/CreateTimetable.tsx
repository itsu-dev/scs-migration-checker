import React, {useRef, useState} from "react";
import "./CreateTimetable.css"
import {getExcludedSeason, isRuleLoaded, kdb, loadKdb, loadRuleDefinitions, ruleDefinitions} from "../App";
import TimeTr, {TimeProps} from "./TimeTr";
import {SubjectProps} from "./SubjectTd";
import MenuBar, {MenuItem} from "../MenuBar";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import {getSeasonsArray, getTimesArray, isOnline} from "../KdBUtils";

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
export let creationType = 1; // 0: 高い志望順位の重点科目を重視, 1: 高い志望順位の応募要件を重視
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
                            type: 2,
                            department: "",
                            relatedModules: [],
                            relatedTimes: [],
                            kdbData: [],
                            onclick: (props: SubjectProps) => {
                                onSubjectClicked(props);
                            }
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

    // 春A, 春B,...のメニューバーを生成する
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
    initializeMenu();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [module, setModule] = useState<Module>(modules.get("春A")!!);
    const [step, setStep] = useState<number>(1);
    const [messages, setMessages] = useState<Array<string>>([]);  // 処理中に発生したメッセージ
    const stepTwoRef = useRef<{ setSubject: (props: SubjectProps) => void }>(null);
    const [selectedSubject, setSelectedSubject] = useState<SubjectProps | null>(null);

    window.onload = () => {
        setLoading(true);
        loadRuleDefinitions(() => {
            loadKdb(() => {
                setLoading(false);
            })
        });
    }

    // モジュール（春A, B等）を切り替える
    const switchModule = (moduleKey: string) => {
        // 再描画させるために中のオブジェクトを更新しておく
        const module = modules.get(moduleKey)!!;
        const newTimes: TimeProps[] = [];
        module.times.forEach((time) => {
            const newSubjects: SubjectProps[] = [];
            time.subjects.forEach(subject => {
                newSubjects.push({
                    subjectName: subject.subjectName,
                    subjectId: subject.subjectId,
                    isOnline: subject.isOnline,
                    season: subject.season,
                    module: subject.module,
                    week: subject.week,
                    time: subject.time,
                    type: subject.type,
                    department: subject.department,
                    relatedModules: [...subject.relatedModules],
                    relatedTimes: [...subject.relatedTimes],
                    kdbData: [...subject.kdbData],
                    onclick: subject.onclick
                });
            })
            newTimes.push({
                time: time.time,
                subjects: newSubjects
            })
        })
        module.times = newTimes;

        const newModule = {
            season: module.season,
            module: module.module,
            times: module.times
        }

        modules.set(module.season + module.season, newModule)
        setModule(newModule);
    }

    const onSubjectClicked = (props: SubjectProps) => {
        stepTwoRef.current?.setSubject(props);
        setSelectedSubject(props);
    }

    // StepTwoの「登録」ボタンを押したときに発火
    const onSubscribeButtonClicked = () => {
        if (selectedSubject !== null) {
            setSubjectsData(
                selectedSubject.kdbData,
                selectedSubject.kdbData[0],
                [...selectedSubject.kdbData],
                2,
                getSeasonsArray(selectedSubject.kdbData),
                getTimesArray(selectedSubject.kdbData)[0],
                isOnline(selectedSubject.kdbData)
            )
            switchModule(selectedSubject!!.season + selectedSubject!!.module);
        }
    }

    // StepTwoの「削除」ボタンを押したときに発火
    const onDeleteButtonClicked = () => {
        if (selectedSubject !== null) {
            clearSubjectsData(selectedSubject.kdbData)
            switchModule(selectedSubject!!.season + selectedSubject!!.module);
        }
    }

    // oldKdbDataの時期に一致する時間割上の科目すべてを初期化する
    const clearSubjectsData = (kdbData: Array<string>) => {
        setSubjectsData(
            kdbData,
            "",
            [],
            2,
            [],
            [],
            false
        )
    }

    // oldKdbDataの時期に一致する時間割上の科目すべてを与えられた値に更新する
    const setSubjectsData = (
        oldKdBData: Array<string>,
        subjectName: string,
        newKdBData: Array<string>,
        type: number,
        relatedModules: Array<string>,
        relatedTimes: Array<string>,
        isOnline: boolean
    ) => {
        const seasonsArray = getSeasonsArray(oldKdBData);
        const timesArray = getTimesArray(oldKdBData)[0];
        seasonsArray.forEach(season => {
            timesArray.forEach(time => {
                const subject = getSubjectWithModuleAndTime(season, time);
                subject.subjectName = subjectName;
                subject.kdbData = newKdBData;
                subject.type = type;
                subject.relatedModules = relatedModules;
                subject.relatedTimes = relatedTimes;
                subject.isOnline = isOnline;
            })
        })
    }

    // moduleとtimeから時間割上の科目を取得する
    // ex) module: 春A, time: 水3
    const getSubjectWithModuleAndTime = (module: string, time: string): SubjectProps => {
        return modules.get(module)!!
            .times
            .filter(t => t.time === +time.charAt(1))[0]!!
            .subjects
            .filter(subject => subject.week === time.charAt(0))[0]!!
    }

    // 指定した名前の科目を時間割から取得
    const getSubjectsWithName = (subjectName: string): SubjectProps[] => {
        const result: SubjectProps[] = [];
        Array.from(modules.values())
            .forEach(module => {
                module.times.forEach(time => {
                    time.subjects
                        .filter(subject => subject.subjectName === subjectName)
                        .forEach(subject => result.push(subject));
                });
            });
        return result;
    }

    // 「時間割を生成する」ボタンを押したときに実行
    // 時間割を生成する
    const startToCreate = () => {
        // 学類・学群が選択されていなければreturn
        if (selectedDepartments.length == 0) {
            alert("1つ以上の学類・学群を選択してください。");
            return;
        }

        // 処理中だったらreturn
        if (isCreating) {
            alert("作成中です。しばらくお待ちください。");
            return;
        }

        // 処理中フラグを立てる
        isCreating = true;

        // 時間割データを初期化
        initialize(true);

        // メッセージを初期化
        setMessages([]);

        // 選択された学類・学群の移行要件を取得
        const departments = ruleDefinitions.departments
            .filter((department) => selectedDepartments.includes(department.departmentName));
        const kdbSubjects = Array.from(kdb.data.values());  // KdBの科目データ
        const kdbCache: Array<Array<string>> = [];  // KdBから検索済みの科目のキャッシュ

        // 選択された全ての学類・学群に対して...
        departments.forEach((department) => {
            // 学類・学群の全ての移行要件に対して...
            department.rules.forEach((rule) => {
                // 応募要件または重点科目の要件で鳴ければreturn
                if (!["required_subjects", "important_subjects"].includes(rule.type)) return;

                // 要件に含まれる全ての科目に対して...
                rule.subjects.forEach((subject) => {
                    if (subject.startsWith("#")) return;  // 特殊な科目だったら処理しない
                    const split = subject.split("::")[0];  // 科目名のみを取り出す

                    // 応募要件か重点科目かを判定
                    let type = "応募要件";
                    if (rule.type === "important_subjects") type = "重点科目"

                    // その科目が時期を決定できるものか堂かを判定
                    const excludedSeason = getExcludedSeason(ruleDefinitions, split);

                    // 要件の除外科目に設定されていたら（時期を判定できない科目だったら）
                    if (excludedSeason !== null && split !== "線形代数A") {
                        // メッセージにその旨を追加する
                        messages.push(`${department.departmentName}では${split}が${type}として設定されていますが、開講時期が${excludedSeason}のため時期を決定できません。`);
                        return;
                    }

                    // KdBから該当する科目のデータを取り出す
                    // まずキャッシュを検索
                    let results = kdbSubjects.filter((value) => value[0] === split);

                    // キャッシュになければKdBを検索
                    if (results.length == 0) {
                        results = kdbSubjects.filter((value) => value[0] === split);
                    }

                    // キャッシュになければ処理不可能科目として処理しない
                    if (results.length == 0) {
                        messages.push(`${split}は科目データに存在しません。`);
                        return;
                    }

                    // 検索結果の先頭を科目データとして使用し、キャッシュに保存する
                    const kdbSubject = results[0];
                    kdbCache.push(kdbSubject);

                    if (split === "線形代数A") {
                        kdbSubject[1] = excludedSeason!!.split(" ")[0];
                        kdbSubject[2] = excludedSeason!!.split(" ")[1];

                        if (getSubjectsWithName("線形代数1").length > 0
                            || getSubjectsWithName("線形代数2").length > 0) {
                            if (!messages.includes("時間割に線形代数1または線形代数2が含まれているため、線形代数Aを除外しました。"))
                                messages.push("時間割に線形代数1または線形代数2が含まれているため、線形代数Aを除外しました。")
                            return;
                        }

                    } else if (split === "微分積分A") {
                        if (getSubjectsWithName("微積分1").length > 0
                            || getSubjectsWithName("微積分2").length > 0) {
                            if (!messages.includes("時間割に微積分1または微積分2が含まれているため、微分積分Aを除外しました。"))
                                messages.push("時間割に微積分1または微積分2が含まれているため、微分積分Aを除外しました。")
                            return;
                        }

                    } else if (split === "線形代数1" || split === "線形代数2") {
                        if (getSubjectsWithName("線形代数A").length > 0) {
                            if (!messages.includes("時間割に線形代数Aが含まれているため、線形代数1と線形代数2を除外しました。"))
                                messages.push("時間割に線形代数Aが含まれているため、線形代数1と線形代数2を除外しました。")
                            return;
                        }

                    } else if (split === "微積分1" || split === "微積分2") {
                        if (getSubjectsWithName("微分積分A").length > 0) {
                            if (!messages.includes("時間割に微分積分Aが含まれているため、微積分1と微積分2を除外しました。"))
                                messages.push("時間割に微分積分Aが含まれているため、微積分1と微積分2を除外しました。")
                            return;
                        }

                    }

                    // 開講時期をパース
                    const seasonsArray = getSeasonsArray(kdbSubject);

                    // 開講時限をパース
                    const [timesArray, needConsul] = getTimesArray(kdbSubject);
                    if (needConsul) {
                        messages.push(`${department.departmentName}では${subject}が${type}として設定されていますが、開講時期が応談のため時期を決定できません。`);
                    }

                    // 重複する科目をすべて取得
                    let duplicates: Array<Array<string>> = [];
                    seasonsArray.forEach(s => {
                        timesArray.forEach(t => {
                            const existingSubject = getSubjectWithModuleAndTime(s, t);
                            if (
                                existingSubject.subjectName !== ""
                                && existingSubject.subjectName !== split
                                && duplicates.filter(sbj => sbj[0] === existingSubject.subjectName).length === 0
                            ) {
                                if ((existingSubject.type === 0 && creationType === 0)
                                    || (existingSubject.type === 1 && creationType === 1)
                                    || existingSubject.type === 2) {
                                }
                                clearSubjectsData(existingSubject.kdbData)
                                // duplicates.push(existingSubject.kdbData);
                            }
                        });
                    });

                    if (duplicates.length > 0) {
                        console.log(split + "_" + kdbSubject[1] + " " + kdbSubject[2])
                        console.log(duplicates)
                    }

                    // 取得した全ての開講時期に対して...
                    seasonsArray.forEach((s) => {
                        // 取得した全ての開講時限に対して...
                        timesArray.forEach((t) => {
                            const module = modules.get(s)!!;  // 該当モジュールの時間割を取得
                            // モジュールの全ての時間（1～6限に対して）
                            module.times.forEach((timeTr) => {
                                // 各曜日・各時限の該当する開講時限の科目を取得
                                const subscribedSubject = timeTr.subjects.filter((subject) => (subject.week + subject.time) === t)?.[0];
                                // 取得した科目が存在すれば
                                if (subscribedSubject) {
                                    // 科目が応募要件由来かつ生成が高い志望順位の重点科目重視、または科目が重点科目由来かつ高い志望順位の応募要件重視、またはユーザーによって作成された科目なら上書きする
                                    if ((subscribedSubject.type === 0 && creationType === 0)
                                        || (subscribedSubject.type === 1 && creationType === 1)
                                        || subscribedSubject.type === 2) {
                                        // TODO 2コマ以上の科目の場合、オーバーライドされてその科目の1コマがつぶれる（ex.プ入Aの秋A木5, 6が5だけになり、秋A木6が別の科目になってしまう）
                                        subscribedSubject.subjectName = split;
                                        subscribedSubject.type = rule.type === "required_subjects" ? 0 : 1
                                        subscribedSubject.isOnline = isOnline(kdbSubject);
                                        subscribedSubject.department = department.departmentName;
                                        subscribedSubject.relatedModules = seasonsArray;
                                        subscribedSubject.relatedTimes = timesArray;
                                        subscribedSubject.kdbData = kdbSubject;
                                    }
                                }
                            });
                        });
                    });
                });
            });
        });
        isCreating = false;
        setMessages([...messages])
        switchModule("春A")
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
                        {step === 2 && <StepTwo
                            onSubscribeButtonClicked={onSubscribeButtonClicked}
                            onDeleteButtonClicked={onDeleteButtonClicked}
                            ref={stepTwoRef}/>}
                    </>
                    }
                </div>
            </div>
            {messages.length > 0 &&
            <div className={"section"}>
                <h3>メッセージ</h3>
                {messages.map((message, index) =>
                    <p key={index}>・{message}<br/></p>
                )}
            </div>
            }
        </>
    )
}

export default CreateTimetable;