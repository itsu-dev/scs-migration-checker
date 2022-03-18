import React, {useState} from "react";

// 科目
export type RuleSubject = {
    name: string,  // 科目名
    isSubscribed: boolean,  // 登録されているかどうか
    nameStartsWith: string | null,  // 名前で~~から始まるもの（必要な場合）
    nameEndsWith: string | null,  // 名前で~~で終わるもの（必要な場合）
    idStartsWith: string | null  // 科目番号で~~から始まるもの（必要な場合）
}

// 応募要件 || 重点科目上限
export type DefinedRule = {
    id: number,
    name: string,
    min: number | null,  // 最小で満たす必要のある単位数
    max: number | null,  // 最大で満たす必要のある単位数
    unit: number,  // 満たしているかどうか
    subjects: Map<string, boolean>  // 応募要件になっている科目
}

export type DepartmentProps = {
    id: number,
    name: string,  // 学類名
    messages: string[],  // メッセージ
    state: 0 | 1 | 2,  // 状態（赤：0, 黄：1, 緑：2）
    isRequirementsSatisfied: boolean,  // 応募要件を満たしているかどうか
    isImportantsSatisfied: boolean,  // 重点科目上限を満たしているかどうか
    rules: DefinedRule[],  // 応募要件 || 重点科目上限
}

const classList = {
    0: 'faculty-name-missed',
    1: 'faculty-name-ok',
    2: 'faculty-name-passed',
}

const DepartmentTd: React.FC<DepartmentProps> = (props: DepartmentProps) => {

    const [hidden, setHidden] = useState(true)

    const handleClicked = () => {
        setHidden(!hidden)
    }

    const DetailsTd: React.FC<DefinedRule> = (value: DefinedRule) => {
        return (
            <tr hidden={hidden}>
                <td colSpan={1} className={'subject-details-name'}>{value.name}</td>
                <td colSpan={3} className={'subject-details-content'}>
                    {value.min != null && <span>ここから{value.min}単位以上</span>}
                    {value.min != null && value.max != null && <span>かつ</span>}
                    {value.max != null && <span>ここから{value.max}単位まで</span>}
                    （登録済み：{value.unit}単位）
                    <br/>
                    {Array.from(value.subjects.keys()).map((key, index) =>
                        <span key={index} className={value.subjects.get(key) ? 'passed-subject' : 'missed-subject'}>{key}&nbsp;&nbsp;</span>)}
                </td>
            </tr>
        )
    }

    return (
        <>
            <tr onClick={handleClicked}>
                <td className={classList[props.state]}>{props.name}</td>
                <td className={'message-box'}>
                    {props.messages.map((value, index) => <span key={index}>・{value}<br/></span>)}
                    {props.rules.length > 0 && <span className={'expand_details'}> クリックで詳細を表示します</span>}
                </td>
                <td className={props.isRequirementsSatisfied ? 'passed' : 'missed'}>
                    {props.isRequirementsSatisfied ? '〇' : '×'}
                </td>
                <td className={props.isImportantsSatisfied ? 'passed' : 'missed'}>
                    {props.isImportantsSatisfied ? '〇' : '×'}
                </td>
            </tr>

            {props.rules.map((value) =>
                <DetailsTd
                    key={props.id + "_" + value.id}
                    id={value.id}
                    name={value.name}
                    min={value.min}
                    max={value.max}
                    unit={value.unit}
                    subjects={value.subjects} />
            )}
        </>
    )
}

export default DepartmentTd;