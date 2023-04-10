import styled from "styled-components";
import MenuBarItem from "./MenuBarItem";
import {useState} from "react";

const Wrapper = styled.div`
  height: 3.0em;
  text-align: center;
  margin: 0 auto 1.0em;
  display: flex;
  justify-content: start;
  align-items: center;
`;

interface MenuBarProps {
    options: ReadonlyArray<string>
    onSelect: (text: string) => void
    defaultSelection?: string
}

const MenuBar = ({options, onSelect, defaultSelection}: MenuBarProps) => {
    const [selectedItem, setSelectedItem] = useState<string | undefined>(defaultSelection);

    const onSelectItem = (text: string) => {
        setSelectedItem(text);
        onSelect(text);
    }

    return (
        <Wrapper>
            { options.map((v, i) => <MenuBarItem text={v} selected={v === selectedItem} onClick={() => onSelectItem(v)} />)}
        </Wrapper>
    )
}

export default MenuBar;