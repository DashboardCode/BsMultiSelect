
export function ChoiceHidden(option, isOptionHidden){
    return {
            option: option,
            isOptionHidden: isOptionHidden,
    }
}

export function Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden){
    let choice = {
            option: option,
            isOptionHidden: isOptionHidden,

            isOptionDisabled: isOptionDisabled,
            isOptionSelected: isOptionSelected,
            
            isHoverIn: false,

            isVisible: false,
            visibleIndex: null, 
            searchText: option.text.toLowerCase().trim(),

            updateDisabled:null,

            updateSelectedFalse: null, // TODO: wired. make as updateDisabled (and move setter isOptionSelected outside ?)
            updateSelectedTrue: null,

            // internal state handlers
            updateVisible: null,
            updateHoverIn: null,
            
            dispose: null
    }
    return choice;
}

export function setOptionSelectedTrue(choice, setSelected){
    let value = false;
    var confirmed = setSelected(choice.option, true);
    if (!(confirmed===false)) {
        choice.updateSelectedTrue();
        value = true;
    }
    return value;
}

export function setOptionSelectedFalse(choice, setSelected){
    let value = false;
    var confirmed = setSelected(choice.option, false);
    if (!(confirmed===false)) {
        choice.updateSelectedFalse();
        value = true;
    }
    return value;
}

export function setOptionSelected(choice, value, setSelected){
    if (value)
        return setOptionSelectedTrue(choice, setSelected)
    else
        return setOptionSelectedFalse(choice, setSelected)
}

export function toggleOptionSelected(choice, setSelected){
    let value =false;
    if (choice.isOptionSelected)
        value = setOptionSelectedFalse(choice, setSelected);
    else
        if (!choice.isOptionDisabled)
            value = setOptionSelectedTrue(choice, setSelected);
    return value;
}

export function updateSelected(choice){
    if (!choice.isOptionHidden)
    {
        let newIsSelected = choice.option.selected;
        if (newIsSelected != choice.isOptionSelected)
        {
                if (newIsSelected)
                    choice.updateSelectedTrue();
                else
                    choice.updateSelectedFalse();
        }
    }
}

export function updateDisabled(choice, getIsOptionDisabled){
    if (!choice.isOptionHidden)
    {
        let newIsDisabled = getIsOptionDisabled(choice.option);
        if (newIsDisabled != choice.isOptionDisabled)
        {
            choice.isOptionDisabled= newIsDisabled;
            choice.updateDisabled();
        }
    }
}