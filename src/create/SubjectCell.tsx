import React from "react";
import "./SubjectCell.css";
import {KdBItem} from "../KdBUtils";

export type SubjectCellProps = {
    season: string,  // const（ex.春）
    module: string,  // const（ex.A）
    week: string,  // const（ex.月）
    time: number,  // const（ex.1）
    type: number,  // 0: 応募要件, 1: 重点科目, 2: ユーザー指定
    isOnline: boolean,  // オンラインかどうか
    kdb: KdBItem | null,  // KdBのデータ
    onclick: (props: SubjectCellProps) => void,  // クリック時に発火させる関数
}

export const TYPE_REQUIREMENT = 0;
export const TYPE_IMPORTANT = 1;
export const TYPE_USER_DEFINED = 2;

const SubjectCell: React.FC<SubjectCellProps> = (props: SubjectCellProps) => {
    return (
        <td className={`subject-box ${props.isOnline && "online"}`} onClick={() => {
            props.onclick(props)
        }}>
            {props.kdb !== null ? props.kdb.name : ""}
        </td>
    )
}

export default SubjectCell;