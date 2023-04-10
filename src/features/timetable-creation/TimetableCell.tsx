import styled from "styled-components";
import {DayOfWeek, Module, Period} from "../../consts/TimetableConstants";
import {KdBData, KdBItem, SubjectId} from "../../consts/KdbConstants";
import {useContext, useEffect, useState} from "react";
import {analyzeKdBModule, analyzeKdBPeriod, getKdBItemById} from "../kdb";
import {KdBContext} from "../../App";

const Wrapper = styled.td`
  text-align: center;
  vertical-align: center;
  background: #eee;
  height: 5.0em;
  cursor: pointer;
  font-size: 0.8em;
  width: 5.0em;
  
  &:hover {
    background: #ccc;
  }
`;

interface TimetableCellProps {
    module: Module
    period: Period
    dayOfWeek: DayOfWeek
    subjectIds: SubjectId[]
    onClick: (subjectId: SubjectId | null, module: Module, period: Period, dayOfWeek: DayOfWeek) => void
}

const TimetableCell = ({module, period, dayOfWeek, subjectIds, onClick}: TimetableCellProps) => {
    const getKdBItem = (subjectIds: SubjectId[], kdbData: KdBData, module: Module, period: Period, dayOfWeek: DayOfWeek): [SubjectId, KdBItem] | null => {
        for (let id of subjectIds) {
            const item = getKdBItemById(kdbData!!, id);
            if (item == null) return null;

            const modules = analyzeKdBModule(item[1]);
            const periods = analyzeKdBPeriod(item[2]);
            if (modules.includes(module) && periods.includes(dayOfWeek + period)) {
                return [id, item];
            }
        }

        return null;
    }

    const kdbData = useContext(KdBContext);
    const [subjectData, setSubjectData] = useState<[SubjectId, KdBItem] | null>(getKdBItem(subjectIds, kdbData!!, module, period, dayOfWeek));

    useEffect(() => setSubjectData(getKdBItem(subjectIds, kdbData!!, module, period, dayOfWeek)), [subjectIds, module])

    return (
        <Wrapper onClick={() => onClick(subjectData ? subjectData[0] : null, module, period, dayOfWeek)}>
            { subjectData && subjectData[1][0]}
        </Wrapper>
    );
}

export default TimetableCell;