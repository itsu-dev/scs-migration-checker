import styled from "styled-components";
import {SubjectId} from "../../consts/KdbConstants";
import {DayOfWeek, DayOfWeeksArray, Module, Period} from "../../consts/TimetableConstants";
import TimetableCell from "./TimetableCell";

const Wrapper = styled.tr`
`;

const PeriodData = styled.th`
  background-color: #00c0d4;
  color: white;
  font-weight: normal;
  border-style: none;
  width: 1.0em;
`;

interface TimetableRowProps {
    module: Module
    period: Period
    subjectIds: SubjectId[]
    onClick: (subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) => void
}

const TimetableRow = ({module, period, subjectIds, onClick}: TimetableRowProps) => {
    return (
        <tr>
            <PeriodData>{period}</PeriodData>
            {DayOfWeeksArray.map((dayOfWeek, i) => <TimetableCell key={i} module={module} period={period} dayOfWeek={dayOfWeek}
                                                                  subjectIds={subjectIds}
                                                                  onClick={(subjectId, module, period, dayOfWeek) => onClick(subjectId, module, period, dayOfWeek)}/>)}
        </tr>
    )
}

export default TimetableRow;

