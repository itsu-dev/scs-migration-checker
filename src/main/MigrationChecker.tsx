import React, {useState} from 'react';
import './MigrationChecker.css';
import DepartmentTd, {DepartmentProps, DefinedRule, RuleSubject} from "./DepartmentTd";
import SubjectBox from "./SubjectBox";
import {isKdbLoaded, isRuleLoaded, KdB, kdb, RuleDefinitions, ruleDefinitions, UserSubject} from "../App";

let csvFile: Blob;
let isChecking = false

const MigrationChecker: React.FC = () => {

    const [departments, setDepartments] = useState(new Array<DepartmentProps>())
    const [subjects, setSubjects] = useState({
        sum: 0,
        text: '',
        hidden: true
    })

    const updateCSVFile = (csv: Blob) => {
        csvFile = csv;
    }

    const startToCheck = () => {
        if (!csvFile) {
            window.alert('ファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.readAsText(csvFile);
        reader.onload = () => {
            const data = loadCSV(reader.result as string);
            setSubjects({
                sum: data[1],
                text: data[2].substring(2),
                hidden: false
            })
            check(data[0]);
            isChecking = false
        }
    }

    const check = (userSubjects: Array<UserSubject>): void => {
        if (isChecking) {
            window.alert("処理中です。しばらくお待ちください。")
            return
        }

        isChecking = true

        const analyzeUnit = (userSubjects: Array<UserSubject>, ruleSubjects: Array<string>): [number, Map<string, boolean>] => {

            let unit = 0.0;
            const subjects = new Map<string, boolean>();

            if (!ruleSubjects) return [unit, subjects];

            ruleSubjects.forEach((ruleSubject) => {
                const userSubject = userSubjects
                    .filter((value) =>
                        value.name === ruleSubject.split("::")[0]
                    )[0]

                if (ruleSubject.startsWith("#OTHER_SUBJECTS")) {
                    let unitCount = 0.0;
                    const maxUnit = +ruleSubject.split(":")[1];

                    userSubjects.forEach((userSubject) => {
                        if (!ruleSubjects.includes(userSubject.name) && unitCount + userSubject.unit <= maxUnit) {
                            unit += userSubject.unit;
                            unitCount += userSubject.unit;
                            if (unitCount >= maxUnit) {
                                subjects.set(`その他の科目（${maxUnit}単位以上）`, true);
                                return;
                            }
                        }
                    })

                    if (unitCount < maxUnit) {
                        subjects.set(`その他の科目（${maxUnit}単位以上）`, false);
                        return;
                    }

                } else if (ruleSubject.startsWith("#CONTENTS")) {
                    const filtered = userSubjects
                        .filter((userSubject) =>
                            userSubject.name.startsWith(ruleSubject.split(":")[1])
                        )

                    if (filtered.length > 0) {
                        filtered.forEach((userSubject) => {
                                unit += userSubject.unit;
                                subjects.set(`${userSubject.name}（${userSubject.unit}単位）`, true);
                            }
                        );

                    } else {
                        subjects.set(`${ruleSubject.split(":")[1]}〇〇`, false);
                    }

                } else if (ruleSubject.startsWith("#CATEGORY")) {
                    const filteredSubjects = Array.from(kdb.data.values())
                        .filter((array) => array[4].includes(ruleSubject.split(":")[1]))

                    let count = 0;

                    if (filteredSubjects.length > 0) {
                        userSubjects.forEach((userSubject) => {
                            const filtered = filteredSubjects.filter((subject) => subject[0] === userSubject.name)
                            if (filtered.length > 0) {
                                subjects.set(`${filtered[0][0]}（${ruleSubject.split(":")[1]}）`, true);
                                count++;
                            }
                        })
                    }

                    if (count == 0) subjects.set(`${ruleSubject.split(":")[1]}`, false);

                } else if (userSubject) {
                    unit += userSubject.unit;
                    subjects.set(`${userSubject.name}（${userSubject.unit}単位）`, true);

                } else {
                    const split = ruleSubject.split("::");
                    subjects.set(`${split[0]}（${split.length > 1 ? split[1] : 1}単位）`, false)

                }
            })

            return [unit, subjects]
        }

        ruleDefinitions.departments.forEach((department, index) => {
            let isRequirementsSatisfied: boolean | null = null  // 応募要件を充足したか
            let isImportantsSatisfied: boolean | null = null  // 重点科目上限を充足したか
            let requirements: Array<boolean> = []
            let importants: Array<boolean> = []
            let messages: string[] = []
            let migrationState: 0 | 1 | 2 = 0
            let rules: DefinedRule[] = []

            department.rules.forEach((rule, ruleIndex) => {
                let analyzed = analyzeUnit(userSubjects, rule.subjects);

                if (rule.message) {
                    messages.push(rule.message)
                }

                const pushRule = () => {
                    rules.push({
                        id: ruleIndex,
                        name: rule.description,
                        min: rule.minimum,
                        max: rule.maximum,
                        unit: analyzed[0],
                        subjects: analyzed[1]
                    })

                }

                switch (rule.type) {
                    case "required_subjects": {
                        requirements.push(!(analyzed[0] < rule.minimum || analyzed[0] > rule.maximum))
                        pushRule();
                        break;
                    }

                    case "important_subjects": {
                        importants.push(!(analyzed[0] < rule.minimum || analyzed[0] > rule.maximum))
                        pushRule();
                        break;
                    }

                    case "required_subjects_limit": {
                        if (analyzed[0] > rule.maximum) {
                            let text = "";
                            rule.subjects.forEach((subject) => {
                                const split = subject.split("::");
                                text += `, ${split[0]} (${split.length == 1 ? 1 : split[1]}単位)`
                            })
                            messages.push(`${text.substring(2)}のうち、最大で取ることができるのは${rule.maximum}単位までです。（履修予定：${analyzed[0]}単位）`)
                        }
                        pushRule();
                        break;
                    }
                }
            })

            isRequirementsSatisfied = !requirements.includes(false)
            isImportantsSatisfied = !importants.includes(false)

            if (isRequirementsSatisfied && isImportantsSatisfied) {
                migrationState = 2;

            } else if (isRequirementsSatisfied && !isImportantsSatisfied) {
                migrationState = 1;
                messages.push("重点科目上限を超えていません");

            } else {
                migrationState = 0;
                messages.push("応募要件を満たしていません");

            }

            const data: DepartmentProps = {
                id: index,
                name: department.departmentName,  // 学類名
                messages: messages,  // メッセージ
                state: migrationState,  // 状態（赤：0, 黄：1, 緑：2）
                isRequirementsSatisfied: isRequirementsSatisfied!!,  // 応募要件を満たしているかどうか
                isImportantsSatisfied: isImportantsSatisfied!!,  // 重点科目上限を満たしているかどうか
                rules: rules  // 応募要件 || 重点科目上限
            }

            setDepartments((previous) => {
                return [...previous, data]
            })
        })
    }

    const loadCSV = (csvText: string): [Array<UserSubject>, number, string] => {
        const csv = csvText.replace(/\nシラバスシラバス（ミラー）/g, "")

        const userSubjects: Array<UserSubject> = [];
        const split = csv.split("\n");
        let subjectText = "";

        let sum = 0.0
        split.forEach((text, index) => {
            if (text.match("^(\")([A-Z0-9]{7})\$") && split.length - 1 > index + 1) {
                const data = split[index + 1].split("\",\"")!!;
                const subject = data[0];
                const unit = +Array.from(data[1]!!.match("[+-]?\\d+(?:\\.\\d+)?")!!.values())[0]
                sum += unit
                const userSubject: UserSubject = {
                    id: Array.from(text.match("^(\")([a-zA-Z0-9]{7})\$")!!.values())[0].substring(1),
                    name: subject,
                    unit: unit
                }
                userSubjects.push(userSubject)
                subjectText += `, ${subject}（${unit}単位）`
            }
        })

        return [userSubjects, sum, subjectText]
    }

    const onStartToCheckButtonClicked = () => {
        setDepartments([])
        while (!isRuleLoaded && !isKdbLoaded) {
        }
        startToCheck()
    }

    const onRequirementsListButtonClicked = () => {
        window.open('migration-requirements.html')
    }

    const onFileStateChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.currentTarget.files !== null) {
            const file = (event.currentTarget as HTMLInputElement).files?.[0]
            if (!file) {
                window.alert('ファイルを選択してください。')
                return
            }

            if (!file.name.endsWith('.csv')) {
                window.alert(('CSVファイルにのみ対応しています。'))
                return;
            }

            updateCSVFile(file)
        }
    }

    return (
        <>
            <div className="menu">
                <div className="menu-left">
                    <input type="file" id="subjects-csv" accept=".csv" onChange={onFileStateChanged}/>
                </div>
                <div className="menu-right">
                    <button id="start-checking" className="primary-button"
                            onClick={onStartToCheckButtonClicked}>確認する
                    </button>
                </div>
            </div>

            <table id="result">
                <tbody>
                <tr>
                    <th>学群・学類</th>
                    <th className="message-box-th">メッセージ</th>
                    <th className="result-box">応募要件</th>
                    <th className="result-box">重点科目上限</th>
                </tr>
                {departments.map((value) =>
                    <DepartmentTd
                        key={value.id}
                        id={value.id}
                        name={value.name}
                        messages={value.messages}
                        state={value.state}
                        isRequirementsSatisfied={value.isRequirementsSatisfied}
                        isImportantsSatisfied={value.isImportantsSatisfied}
                        rules={value.rules}/>
                )}
                </tbody>
            </table>

            {!subjects.hidden &&
            <div id="subjects-box">
                <SubjectBox sum={subjects.sum} text={subjects.text} hidden={subjects.hidden}/>
            </div>
            }

            <h3>使い方</h3>
            <p>
                1．<a href="https://make-it-tsukuba.github.io/alternative-tsukuba-kdb">KdBもどき</a>にアクセスする<br/>
                2．仮の履修時間割を組む<br/>
                3．検索条件をクリアし、「お気に入り」にチェックを入れて検索する<br/>
                4．画面最下部の「CSVダウンロード」をクリックする<br/>
                5．移行要件ツールでダウンロードしたCSVファイルを選択する<br/>
                6．「確認する」を押す
            </p>
            <p>
                ・このツールではPCからのアクセスを推奨しています。<br />
                ・応募可能で重点科目上限単位数を超えている場合には緑、重点科目単位数を超えていない場合には黄、そのどちらでもない場合には赤で示しています。<br/>
                ・履修を組む際の参考としてお使いください。<br/>
                ・各学類・学群をクリックすると詳細が見られます。<br/>
                ・使用したCSVファイルはサーバーには保存されません。<br/>
                ・このツールの使用によって生じた不利益等について、開発者は一切の責任を負いません。<br/>
                ・医学類の判定には対応しておりません。
            </p>
        </>
    );
}

export default MigrationChecker;
