import styled from "styled-components";
import React from "react";
import {KdBItem, SubjectId} from "../../../consts/KdbConstants";

const Wrapper = styled.p`
  width: auto;
  cursor: pointer;
  margin: 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubjectIdSpan = styled.span`
  color: gray;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Online = styled.span`
  color: #ff8a47;
`;

const NeedSubscription = styled.span`
  color: #6ecf63;
`;

interface SubjectListItemProps {
    subjectId: SubjectId
    kdbItem: KdBItem
    onClick: (kdbItem: KdBItem) => void
}

const SubjectListItem = ({ subjectId, kdbItem, onClick }: SubjectListItemProps) => {
    return (
        <Wrapper onClick={() => onClick(kdbItem)}>
            <SubjectIdSpan>#{subjectId}&nbsp;</SubjectIdSpan>
            {kdbItem[0]}
            {/* isOnline(kdbItem) && <Online>&nbsp;オンライン</Online> */}
            {/* needSubscribe(kdbItem) && <NeedSubscription>&nbsp;事前登録対象</NeedSubscription> */}
        </Wrapper>
    )
}

export default SubjectListItem;