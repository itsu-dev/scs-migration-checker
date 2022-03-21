import React, {ForwardedRef, forwardRef, ForwardRefExoticComponent, useImperativeHandle, useState} from "react";
import {SubjectProps} from "./SubjectTd";
import "./StepTwo.css";
import {isOnline, needSubscribe, searchKdBWithModule} from "../KdBUtils";

export type StepTwoProps = {
    onSubscribeButtonClicked: () => void,
    onDeleteButtonClicked: () => void
}

const _searchKdBWithModule = (module: string, time: string): Promise<Array<Array<string>>> => {
    return new Promise<Array<Array<string>>>(resolve => {
        resolve(searchKdBWithModule(module, time));
    });
}

const StepTwoBase: React.ForwardRefRenderFunction<{ setSubject: (props: SubjectProps) => void }, StepTwoProps> = (props: StepTwoProps, ref) => {
    // kdbData, ifFromTimetable
    const [selectedSubject, setSelectedSubject] = useState<[Array<string>, boolean]>([[], false]);

    // クリックしたtdの値
    const [selectedSubjectProps, setSelectedSubjectProps] = useState<SubjectProps | null>(null);

    // その他の科目にはいる科目
    const [otherSubjects, setOtherSubjects] = useState<Array<Array<string>>>([]);

    // KdBで検索
    const searchKdB = async (module: string, time: string): Promise<void> => {
        setOtherSubjects(await _searchKdBWithModule(module, time));
    }

    // 時間割上のtdをクリックしたときに発火
    useImperativeHandle(ref, () => ({
        setSubject(props: SubjectProps) {
            setSelectedSubjectProps(props);
            setSelectedSubject([props.kdbData, true]);
            searchKdB(props.season + props.module, props.week + props.time);
        }
    }))

    return (
        <>
            {selectedSubject.length > 0 &&
            <div className={"section subject-description"}>
                <h3>{selectedSubject[0][0]}</h3>
                {selectedSubject[0].length > 0 &&
                <>
                    <p>
                        {selectedSubject[0][1]}&nbsp;
                        {selectedSubject[0][2]}
                        {isOnline(selectedSubject[0]) &&
                        <span className={"online"}>&nbsp;オンライン</span>
                        }
                        {needSubscribe(selectedSubject[0]) &&
                        <span className={"need-subscribe"}>&nbsp;事前登録対象</span>
                        }
                    </p>
                    <p>{selectedSubject[0][4]}</p>
                    <div className={"button-box"}>
                        <button className={"primary-button"} onClick={() => {
                            props.onSubscribeButtonClicked();
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

            {selectedSubject[0].length == 0 &&
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
                            {subject[0]}
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