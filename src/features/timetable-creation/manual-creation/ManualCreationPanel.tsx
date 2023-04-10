import styled from "styled-components";
import React, {forwardRef, useContext, useImperativeHandle, useState} from "react";
import {SubjectCellProps} from "../../../create/SubjectCell";
import SubjectDescription from "./SubjectDescription";
import SubjectList from "./SubjectList";
import {KdBData, KdBItem, SubjectId} from "../../../consts/KdbConstants";
import {DayOfWeek, Module, Period} from "../../../consts/TimetableConstants";
import {filterKdBBySpecificPeriod} from "../../kdb";
import {KdBContext} from "../../../App";

const Wrapper = styled.div`
`;

interface ManualCreationPanelProps {
    currentModule: Module
    subjectIds: SubjectId[]
    onSubscribeButtonClicked: (subjectId: SubjectId) => void
    onDeleteButtonClicked: (subjectId: SubjectId) => void
}

const _ManualCreationPanel: React.ForwardRefRenderFunction<{ onCellClick: (subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) => void }, ManualCreationPanelProps> = (props: ManualCreationPanelProps, ref) => {
    const kdbData = useContext(KdBContext);
    // kdbData
    const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);

    // その他の科目にはいる科目
    const [filteredKdBData, setFilteredKdBData] = useState<KdBData>({});

    const _searchKdBWithModule = (module: Module, period: Period, dayOfWeek: DayOfWeek): Promise<KdBData> => {
        return new Promise<KdBData>(resolve => {
            resolve(filterKdBBySpecificPeriod(kdbData!!, module, dayOfWeek, period));
        });
    }

    // KdBで検索
    const searchWithKdB = async (module: Module, period: Period, dayOfWeek: DayOfWeek): Promise<void> => {
        setFilteredKdBData(await _searchKdBWithModule(module, period, dayOfWeek));
    }

    const onSubjectButtonClick = () => {
        if (selectedSubject) {
            props.onSubscribeButtonClicked(selectedSubject);
        }
    }

    const onDeleteButtonClick = () => {
        props.onDeleteButtonClicked(selectedSubject!!);
    }

    const onOtherSubjectsItemClick = (subjectId: SubjectId) => {
        setSelectedSubject(subjectId);
    }

    // 時間割上のtdをクリックしたときに発火
    useImperativeHandle(ref, () => ({
        onCellClick(subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) {
            setSelectedSubject(subjectId);
            (async () => {
                await searchWithKdB(module, period, dayOfWeek);
            })();
        }
    }));

    return (
        <Wrapper>
            <SubjectDescription subjectId={selectedSubject} showDeleteButton={selectedSubject ? props.subjectIds.includes(selectedSubject) : false}
                                onSubscribeButtonClick={onSubjectButtonClick}
                                onDeleteButtonClick={onDeleteButtonClick}/>
            <SubjectList kdbData={filteredKdBData} onItemClick={(kdbItem) => onOtherSubjectsItemClick(kdbItem)}/>
        </Wrapper>
    )
}

const ManualCreationPanel = forwardRef(_ManualCreationPanel);

export default ManualCreationPanel;