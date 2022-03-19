export type MenuItem = {
    text: string,
    selectedCondition: (text: string) => boolean,
    onClick: () => void
}

export type MenuBarProps = {
    menuItems: MenuItem[]
}

const MenuBar: React.FC<MenuBarProps> = (props: MenuBarProps) => {
    return (
        <div className={"menu menu-bar"}>
            {props.menuItems.map((menuItem, index) =>
                <div key={index} className={`menu-item ${menuItem.selectedCondition(menuItem.text) && "selected"}`} onClick={menuItem.onClick}>
                    {menuItem.text}
                </div>
            )}
        </div>
    )
}

export default MenuBar;