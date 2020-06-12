export function OptionToggleAspect(setOptionSelectedAspect){
    return {
        toggle: (choice)=>toggle(setOptionSelectedAspect, choice)
    }
}


function toggle(setOptionSelectedAspect, choice){
    var success = false;
    if (choice.isOptionSelected || !choice.isOptionDisabled)
        success = setOptionSelectedAspect.setOptionSelected(choice, !choice.isOptionSelected);
    return success;
}