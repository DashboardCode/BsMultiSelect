export function OptionToggleAspect(choiceAspect){
    return {
        toggle: (choice)=>toggle(choiceAspect.setOptionSelected, choice)
    }
}


function toggle(setOptionSelected, choice){
    var success = false;
    if (choice.isOptionSelected || !choice.isOptionDisabled)
        success = setOptionSelected(choice, !choice.isOptionSelected);
    return success;
}