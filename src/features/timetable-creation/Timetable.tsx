import styled from "styled-components";
import {DayOfWeek, DayOfWeeksArray, Module, Period, PeriodsArray} from "../../consts/TimetableConstants";
import React, {useEffect} from "react";
import {SubjectId} from "../../consts/KdbConstants";
import TimetableRow from "./TimetableRow";

const Wrapper = styled.table`
    table-layout: fixed;
`;

const TableHeader = styled.th`
  background-color: #00c0d4;
  color: white;
  font-weight: normal;
  border-style: none;
  width: 1.0em;
`;

interface TimetableProps {
    subjectIds: SubjectId[]
    currentModule: Module
    onCellClick: (subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) => void
}

const Timetable = ({subjectIds, currentModule, onCellClick}: TimetableProps) => {
    return (
        <Wrapper>
            <tbody>
            <tr>
                <TableHeader />
                {DayOfWeeksArray.map((dayOfWeek, i) => <TableHeader key={i}>{dayOfWeek}</TableHeader>)}
            </tr>
            {PeriodsArray.map((period, i) => <TimetableRow key={i} module={currentModule} period={period}
                                                           subjectIds={subjectIds}
                                                           onClick={(subjectId, module, period, dayOfWeek) => onCellClick(subjectId, module, period, dayOfWeek)}/>)}
            </tbody>
        </Wrapper>
    )
}

export default Timetable;
