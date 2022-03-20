import React, {forwardRef, useImperativeHandle, useState} from "react";
import {SubjectProps} from "./SubjectTd";
import "./StepTwo.css";
import {searchKdBWithModule} from "../KdBUtils";

const _searchKdBWithModule = (module: string, time: string): Promise<Array<Array<string>>> => {
    return new Promise<Array<Array<string>>>(resolve => {
        resolve(searchKdBWithModule(module, time));
    });
}

const StepTwoBase: React.ForwardRefRenderFunction<{ setSubject: (props: SubjectProps) => void }> = ({}, ref) => {
    const [selectedSubject, setSelectedSubject] = useState<SubjectProps | null>(null);
    const [otherSubjects, setOtherSubjects] = useState<Array<Array<string>>>([]);

    const searchKdB = async (module: string, time: string): Promise<void> => {
        setOtherSubjects(await _searchKdBWithModule(module, time));
    }

    useImperativeHandle(ref, () => ({
        setSubject(props: SubjectProps) {
            setSelectedSubject(props);
            if (props.kdbData.length > 0) {
                searchKdB(props.kdbData[1], props.kdbData[2]);
            } else {
                searchKdB(props.season + props.module, props.week + props.time);
            }
        }
    }))

    return (
        <>
            {selectedSubject !== null && selectedSubject.subjectName !== "" &&
            <div className={"section subject-description"}>
                <h3>{selectedSubject.subjectName}</h3>
                {selectedSubject.kdbData.length > 0 &&
                <>
                    <p>{selectedSubject.kdbData[1]}&nbsp;{selectedSubject.kdbData[2]}{selectedSubject.isOnline &&
                    <span className={"online"}>&nbsp;オンライン</span>}</p>
                    <p>{selectedSubject.kdbData[4]}</p>
                </>
                }
            </div>
            }

            <div className={"section"}>
                <h3>おすすめの科目</h3>
                <p>あなたと同じような学類・学群を志望した先輩はこのような科目をとっています。</p>
            </div>

            <div className={"section"}>
                <h3>その他の科目</h3>
                <p>この時限に開講されている他の科目</p>
                <div className={"subjects-box"}>
                    {otherSubjects.map(subject =>
                        <p>{subject[0]}</p>
                    )}
                </div>
            </div>
        </>
    )
}

const StepTwo = forwardRef(StepTwoBase);

export default StepTwo;