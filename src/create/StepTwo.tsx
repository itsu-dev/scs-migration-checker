import React, {ForwardedRef, forwardRef, ForwardRefExoticComponent, useImperativeHandle, useState} from "react";
import {SubjectCellProps} from "./SubjectCell";
import "./StepTwo.css";
import {isOnline, KdBItem, needSubscribe, searchKdBWithModule} from "../KdBUtils";

export type StepTwoProps = {
    onSubscribeButtonClicked: (kdb: KdBItem) => void,
    onDeleteButtonClicked: () => void
}

const _searchKdBWithModule = (module: string, time: string): Promise<Array<KdBItem>> => {
    return new Promise<Array<KdBItem>>(resolve => {
        resolve(searchKdBWithModule(module, time));
    });
}

const StepTwoBase: React.ForwardRefRenderFunction<{ onCellClicked: (props: SubjectCellProps) => void }, StepTwoProps> = (props: StepTwoProps, ref) => {
    // kdbData, ifFromTimetable
    const [selectedSubject, setSelectedSubject] = useState<[KdBItem | null, boolean]>([null, false]);

    // 選択された時間割上のセル
    const [selectedCell, setSelectedCell] = useState<SubjectCellProps | null>(null);

    // その他の科目にはいる科目
    const [otherSubjects, setOtherSubjects] = useState<Array<KdBItem>>([]);

    // KdBで検索
    const searchKdB = async (module: string, time: string): Promise<void> => {
        setOtherSubjects(await _searchKdBWithModule(module, time));
    }

    // 時間割上のtdをクリックしたときに発火
    useImperativeHandle(ref, () => ({
        onCellClicked(props: SubjectCellProps) {
            console.log(props.kdb)
            setSelectedCell(props);
            setSelectedSubject([props.kdb, true]);
            searchKdB(props.season + props.module, props.week + props.time);
        }
    }))

    return (
        <>
            {selectedSubject.length > 0 && selectedSubject[0] !== null &&
            <div className={"section subject-description"}>
                <h3>{selectedSubject[0].name}</h3>
                {selectedSubject[0] !== null &&
                <>
                    <p>
                        {selectedSubject[0]?.modulesText}&nbsp;
                        {selectedSubject[0]?.periodsText}
                        {isOnline(selectedSubject[0]) &&
                        <span className={"online"}>&nbsp;オンライン</span>
                        }
                        {needSubscribe(selectedSubject[0]) &&
                        <span className={"need-subscribe"}>&nbsp;事前登録対象</span>
                        }
                    </p>
                    <p>{selectedSubject[0]?.description}</p>
                    <div className={"button-box"}>
                        <button className={"primary-button"} onClick={() => {
                            props.onSubscribeButtonClicked(selectedSubject[0]!!);
                            setSelectedSubject([selectedSubject[0], true]);
                        }}>登録
                        </button>
                        {selectedSubject[1] &&
                        <button className={"secondary-button"} onClick={() => {
                            props.onDeleteButtonClicked();
                            setSelectedSubject([selectedSubject[0], false]);
                        }}>削除
                        </button>
                        }
                    </div>
                </>
                }
            </div>
            }

            {selectedSubject[0] === null &&
                <p>時間割上の時限をクリックし、科目を選択してください。</p>
            }

            {
                /*
                <div className={"section"}>
                   <h3>おすすめの科目</h3>
                   <p>あなたと同じような学類・学群を志望した先輩はこのような科目をとっています。</p>
                </div>
                 */
            }

            <div className={"section"}>
                <h3>その他の科目</h3>
                <p>この時限に開講されている他の科目</p>
                <div className={"subjects-box"}>
                    {otherSubjects.map((subject, index) =>
                        <p onClick={() => {
                            setSelectedSubject([subject, false]);
                        }} key={index}>
                            {subject.name}
                            {isOnline(subject) &&
                            <span className={"online"}>&nbsp;オンライン</span>
                            }
                            {needSubscribe(subject) &&
                            <span className={"need-subscribe"}>&nbsp;事前登録対象</span>
                            }
                        </p>
                    )}
                </div>
            </div>
        </>
    )
}

const StepTwo = forwardRef(StepTwoBase);

export default StepTwo;