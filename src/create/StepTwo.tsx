import React, {forwardRef, useImperativeHandle, useState} from "react";
import {SubjectProps} from "./SubjectTd";
import "./StepTwo.css";
import {isOnline, needSubscribe, searchKdBWithModule} from "../KdBUtils";

const _searchKdBWithModule = (module: string, time: string): Promise<Array<Array<string>>> => {
    return new Promise<Array<Array<string>>>(resolve => {
        resolve(searchKdBWithModule(module, time));
    });
}

const StepTwoBase: React.ForwardRefRenderFunction<{ setSubject: (props: SubjectProps) => void }> = ({}, ref) => {
    const [selectedSubject, setSelectedSubject] = useState<Array<string>>([]);
    const [otherSubjects, setOtherSubjects] = useState<Array<Array<string>>>([]);

    const searchKdB = async (module: string, time: string): Promise<void> => {
        setOtherSubjects(await _searchKdBWithModule(module, time));
    }

    useImperativeHandle(ref, () => ({
        setSubject(props: SubjectProps) {
            setSelectedSubject(props.kdbData);
            searchKdB(props.season + props.module, props.week + props.time);
        }
    }))

    return (
        <>
            {selectedSubject.length > 0 &&
            <div className={"section subject-description"}>
                <h3>{selectedSubject[0]}</h3>
                {selectedSubject.length > 0 &&
                <>
                    <p>
                        {selectedSubject[1]}&nbsp;
                        {selectedSubject[2]}
                        { isOnline(selectedSubject) &&
                            <span className={"online"}>&nbsp;オンライン</span>
                        }
                        { needSubscribe(selectedSubject) &&
                        <span className={"need-subscribe"}>&nbsp;事前登録対象</span>
                        }
                    </p>
                    <p>{selectedSubject[4]}</p>
                </>
                }
            </div>
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
                    {otherSubjects.map(subject =>
                        <p onClick={ () => { setSelectedSubject(subject); } }>
                            {subject[0]}
                            { isOnline(subject) &&
                                <span className={"online"}>&nbsp;オンライン</span>
                            }
                            { needSubscribe(subject) &&
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