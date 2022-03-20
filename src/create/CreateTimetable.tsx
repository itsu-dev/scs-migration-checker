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
                            kdbData:[],
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
    const stepTwoRef = useRef<{ setSubject: (props: SubjectProps) => void }>(null);

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
        module.times.forEach((time) => {
            time.subjects = [...time.subjects];
        })
        module.times = [...module.times];
        setModule(module);
    }

    const onSubjectClicked = (props: SubjectProps) => {
        stepTwoRef.current?.setSubject(props);
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

        // 選択された学類・学群の移行要件を取得
        const departments = ruleDefinitions.departments
            .filter((department) => selectedDepartments.includes(department.departmentName));
        const kdbSubjects = Array.from(kdb.data.values());  // KdBの科目データ
        const kdbCache: Array<Array<string>> = [];  // KdBから検索済みの科目のキャッシュ
        const messages: string[] = [];  // 処理中に発生したメッセージ

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
                    if (rule.type === "important_subject") type = "重点科目"

                    // その科目が時期を決定できるものか堂かを判定
                    const excludedSeason = getExcludedSeason(ruleDefinitions, split);

                    // 要件の除外科目に設定されていたら（時期を判定できない科目だったら）
                    if (excludedSeason !== null) {
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

                    // 開講時期をパース
                    const seasonsArray = getSeasonsArray(kdbSubject);

                    // 開講時限をパース
                    const [timesArray, needConsul] = getTimesArray(kdbSubject);
                    if (needConsul) {
                        messages.push(`${department.departmentName}では${subject}が${type}として設定されていますが、開講時期が応談のため時期を決定できません。`);
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
        console.log(messages);
        isCreating = false;
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
                        {step === 2 && <StepTwo ref={stepTwoRef}/>}
                    </>
                    }
                </div>
            </div>
        </>
    )
}

export default CreateTimetable;