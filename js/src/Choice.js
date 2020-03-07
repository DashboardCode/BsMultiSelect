export function Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden){
    let choice = {
        option: option,
        isOptionHidden: isOptionHidden,

        isOptionSelected: isOptionSelected,
        isOptionDisabled: isOptionDisabled,
        
        isHoverIn: false,

        isVisible: false,
        visibleIndex: null, 
        searchText: option.text.toLowerCase().trim(),

        updateDisabled: null,
        updateSelected: null,

        // internal state handlers
        updateVisible: null,
        updateHoverIn: null,
        
        dispose: null
    }
    return choice;
}

export function setOptionSelected(choice, value, setSelected){
    let success = false;
    var confirmed = setSelected(choice.option, value);
    if (!(confirmed===false)) {
        choice.isOptionSelected = value;
        choice.updateSelected();
        success = true;
    }
    return success;
}

export function updateSelectedChoice(choice){
    let newIsSelected = choice.option.selected;
    if (newIsSelected != choice.isOptionSelected)
    {
        choice.isOptionSelected= newIsSelected;
        if (!choice.isOptionHidden)
            choice.updateSelected();
    }
}

export function updateDisabledChoice(choice, getIsOptionDisabled){
    let newIsDisabled = getIsOptionDisabled(choice.option);
    if (newIsDisabled != choice.isOptionDisabled)
    {
        choice.isOptionDisabled= newIsDisabled;
        if (!choice.isOptionHidden)
            choice.updateDisabled();
    }
}