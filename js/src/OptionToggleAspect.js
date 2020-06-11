export function OptionToggleAspect(choiceAspect){
    return {
        toggle: (choice)=>toggle(choiceAspect, choice)
    }
}


function toggle(choiceAspect, choice){
    var success = false;
    if (choice.isOptionSelected || !choice.isOptionDisabled)
        success = choiceAspect.setOptionSelected(choice, !choice.isOptionSelected);
    return success;
}