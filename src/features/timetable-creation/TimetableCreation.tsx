import styled from "styled-components";
import MenuBar from "../../components/menubar/MenuBar";
import {DayOfWeek, Module, ModulesArray, Period} from "../../consts/TimetableConstants";
import React, {useContext, useEffect, useRef, useState} from "react";
import Timetable from "./Timetable";
import {SubjectId} from "../../consts/KdbConstants";
import StepOne from "../../create/StepOne";
import ManualCreationPanel from "./manual-creation/ManualCreationPanel";
import {SubjectCellProps} from "../../create/SubjectCell";
import {analyzeKdBModule, analyzeKdBPeriod, filterKdBBySpecificPeriod, getKdBItemById} from "../kdb";
import Alert from "../../components/alert/Alert";
import {KdBContext} from "../../App";

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

const Left = styled.div`
  width: 70%;
  margin-right: 0.5em;
`;

const Right = styled.div`
  width: 30%;
  margin-left: 0.5em;
`;

const CreationModeArray = ['カスタマイズ'] as const;
type CreationMode = typeof CreationModeArray[number];

const TimetableCreation = () => {
    const [subjectIds, setSubjectIds] = useState<SubjectId[]>([]);
    const [currentModule, setCurrentModule] = useState<Module>(ModulesArray[0]);

    const [creationMode, setCreationMode] = useState<CreationMode>(CreationModeArray[0]);
    const manualCreationPanelRef = useRef<{ onCellClick: (subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) => void }>(null);

    const save = (array: SubjectId[]) => {
        localStorage.setItem("subjects", JSON.stringify(array));
    }

    // 時間割上のセルをクリックしたら
    const onCellClick = (subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) => {
        manualCreationPanelRef!!.current!!.onCellClick(subjectId, module, period, dayOfWeek);
    }

    // 自動生成
    const onStartToCreateButtonClicked = () => {

    }

    // カスタマイズ
    const onSubscribeButtonClicked = (subjectId: SubjectId) => {
        if (subjectIds.includes(subjectId)) {
            alert("この科目は既に登録されています")
            return;
        }

        const newArray = [...subjectIds, subjectId];
        save(newArray);
        setSubjectIds(newArray);
    }

    const onDeleteButtonClicked = (subjectId: SubjectId) => {
        const newArray = subjectIds.filter(v => v !== subjectId);
        save(newArray);
        setSubjectIds(newArray);
    }

    useEffect(() => {
        setTimeout(() => {
            const array = localStorage.getItem("subjects");
            if (array) setSubjectIds(JSON.parse(array) as SubjectId[]);
        }, 300)
    }, []);

    return (
        <Wrapper>
            <Left>
                <MenuBar options={ModulesArray} onSelect={(item) => setCurrentModule(item as Module)} defaultSelection={currentModule}/>
                <Timetable subjectIds={subjectIds} currentModule={currentModule}
                           onCellClick={(subjectId, module, period, dayOfWeek) => onCellClick(subjectId, module, period, dayOfWeek)}/>
            </Left>
            <Right>
                <MenuBar options={CreationModeArray} onSelect={item => setCreationMode(item as CreationMode)} defaultSelection={creationMode} />
                {/* creationMode == CreationModeArray[0] && <StepOne startToCreate={onStartToCreateButtonClicked}/> */}
                {creationMode == CreationModeArray[0] && <ManualCreationPanel
                    currentModule={currentModule}
                    subjectIds={subjectIds}
                    onSubscribeButtonClicked={onSubscribeButtonClicked}
                    onDeleteButtonClicked={onDeleteButtonClicked}
                    ref={manualCreationPanelRef}/>}
            </Right>
        </Wrapper>
    )
}

export default TimetableCreation;