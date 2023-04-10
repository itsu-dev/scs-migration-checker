import styled from "styled-components";
import {primaryColor} from "../../consts/ColorTheme";

const Wrapper = styled.div<{ selected: boolean }>`
  color: ${props => props.selected ? `#${primaryColor}` : 'gray'};
  border-bottom: ${props => props.selected ? `#${primaryColor}` : 'transparent'} solid 4px;
  padding: 0 1.0em 1.0em;
  margin: auto 0;
  cursor: pointer;

  &:hover {
    color: #${primaryColor};
    border-bottom-color: #${primaryColor};
  }
`;

interface MenuBarItemProps {
    text: string
    selected: boolean
    onClick: (text: string) => void
}

const MenuBarItem = ({text, selected, onClick}: MenuBarItemProps) => {
    return (
        <Wrapper selected={selected} onClick={() => onClick(text)}>{ text }</Wrapper>
    )
}

export default MenuBarItem;