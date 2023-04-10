import styled from "styled-components";
import SubjectListItem from "./SubjectListItem";
import {useState} from "react";
import {KdBData, KdBItem, SubjectId} from "../../../consts/KdbConstants";
import {filterKdBByIdOrName} from "../../kdb";

const Wrapper = styled.div`
  margin-top: 1.0em;
`;

const SearchInput = styled.input`
  border: lightgray solid 2px;
  border-radius: 8px;
  padding: 4px 8px;
  width: 100%;
  box-sizing: border-box;
  font-size: 1.0em;

  &:hover {
    outline: none;
    border-color: #6600cc;
    border-width: 2px;
  }
`;

const ListWrapper = styled.div`
  max-height: 200px;
  overflow-y: scroll;
  margin-top: 0.5em;
`;

interface SubjectListProps {
    kdbData: KdBData
    onItemClick: (subjectId: SubjectId) => void
}

const SubjectList = ({kdbData, onItemClick}: SubjectListProps) => {
    const [keyword, setKeyword] = useState<string>("");

    return (
        <Wrapper>
            <SearchInput type={"text"} placeholder={"名前、科目番号で検索"} onInput={(e) => setKeyword(e.currentTarget.value)}/>
            <ListWrapper>
                {
                    Object.entries(filterKdBByIdOrName(kdbData, keyword)).map((entry, i) => <SubjectListItem
                        subjectId={entry[0]} kdbItem={entry[1]} onClick={() => onItemClick(entry[0])} key={i}/>)
                }
            </ListWrapper>
        </Wrapper>
    )
}

export default SubjectList;