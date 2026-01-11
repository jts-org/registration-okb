import { useRef } from "react";
import ToggleButtons from "./common/ToggleButtons";
import { MAIN_MENU_OPTIONS } from "../constants";

function MainMenu({ selected, onSelect }) {
  const buttonRef = useRef(null);

  const handleClick = (option) => {
    onSelect(option);
  };

  return (
    <div className="main-menu">
      <ToggleButtons
        onClick={handleClick}
        buttonsGroup={MAIN_MENU_OPTIONS}
        buttonRef={buttonRef}
        selected={selected}
        single={false}
        sx={{}}
        disabled={false}
      />
    </div>
  );
}

export default MainMenu;