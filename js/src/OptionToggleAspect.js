export function OptionToggleAspect(setOptionSelectedAspect){
    return {
        toggle: (choice) => setOptionSelectedAspect.setOptionSelected(choice, !choice.isOptionSelected)
    }
}
