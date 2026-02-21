/**
 * Copyright (c) 2025-2026 Jouni Sipola
 * All rights reserved.
 */

import { useRef, useMemo } from "react";
import ToggleButtons from "../common/ToggleButtons";
import { TABS } from "../../constants";
import { useFeatureFlags, useTranslation } from "../../contexts/ConfigContext";

function MainMenu({ selected, onSelect }) {
  const buttonRef = useRef(null);
  const { features } = useFeatureFlags();
  const t = useTranslation();

  // Build menu options based on enabled features
  const menuOptions = useMemo(() => {
    const options = [];
    
    if (features.traineeRegistration) {
      options.push({
        label: t('navigation.trainingSessions'),
        value: TABS.TRAINING_SESSION
      });
    }
    
    if (features.coachRegistration) {
      options.push({
        label: t('navigation.coaches'),
        value: TABS.COACH
      });
    }
    
    if (features.adminPanel) {
      options.push({
        label: t('navigation.admin'),
        value: TABS.ADMIN
      });
    }
    
    return options;
  }, [features, t]);

  const handleClick = (option) => {
    // Find the option and get its value (tab key)
    const selectedOption = menuOptions.find(opt => opt.label === option);
    if (selectedOption) {
      onSelect(selectedOption.value);
    } else {
      // Fallback: use the option directly (for backwards compatibility)
      onSelect(option);
    }
  };

  // Extract just the labels for ToggleButtons
  const buttonLabels = menuOptions.map(opt => opt.label);

  return (
    <div className="main-menu">
      <ToggleButtons
        onClick={handleClick}
        buttonsGroup={buttonLabels}
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