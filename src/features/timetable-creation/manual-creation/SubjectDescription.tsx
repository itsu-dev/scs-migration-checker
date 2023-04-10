import styled from "styled-components";
import {isOnline, KdBItem, needSubscribe} from "../../../KdBUtils";
import React, {useContext} from "react";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import {SubjectId} from "../../../consts/KdbConstants";
import {getKdBItemById} from "../../kdb";
import {KdBContext} from "../../../App";

const Wrapper = styled.div`
  padding-left: 1.0em;
  border-left: #6600cc solid 4px;
`;

const SubjectIdAnchor = styled.a`
  color: gray;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubjectTitle = styled.h3`
  padding: 0;
  margin: 0 0 0.25em;
  background: transparent;
  border: none;
  font-weight: normal;
  font-size: 1.2em;
`;

const Online = styled.span`
  color: #ff8a47;
`;

const NeedSubscription = styled.span`
  color: #6ecf63;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 0 1.0em;
  margin-top: 0.5em;
`;

interface SubjectDescriptionProps {
    subjectId: SubjectId | null
    showDeleteButton: boolean
    onSubscribeButtonClick: () => void
    onDeleteButtonClick: () => void
}

const SubjectDescription = ({ subjectId, showDeleteButton, onSubscribeButtonClick, onDeleteButtonClick }: SubjectDescriptionProps) => {
    const kdbData = useContext(KdBContext);
    const kdbItem = subjectId ? getKdBItemById(kdbData!!, subjectId) : null;

    return (
        <>
            { !kdbItem && <p>時間割上の時限をクリックし、科目を選択してください。</p> }
            { kdbItem &&
            <Wrapper>
                <SubjectTitle>{kdbItem[0]}</SubjectTitle>
                <SubjectIdAnchor
                    href={`https://kdb.tsukuba.ac.jp/syllabi/2022/${subjectId}/jpn`}
                    target={"_blank"}
                    title={"2022年度版のシラバス"}
                >#{subjectId}&nbsp;</SubjectIdAnchor>
                {kdbItem[1]}&nbsp;
                {kdbItem[2]}
                <span>（{kdbItem[5]}単位）</span>
                {/* isOnline(kdbItem) && <Online>オンライン&nbsp;</Online> */}
                {/* needSubscribe(kdbItem) && <NeedSubscription>事前登録対象</NeedSubscription> */}
                <p>{kdbItem[4]}</p>
                <ButtonWrapper>
                    <PrimaryButton onClick={onSubscribeButtonClick}>登録</PrimaryButton>
                    { showDeleteButton && <SecondaryButton onClick={onDeleteButtonClick}>削除</SecondaryButton>}
                </ButtonWrapper>
            </Wrapper>
            }
        </>
    )
}

export default SubjectDescription;