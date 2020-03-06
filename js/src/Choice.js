
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
            
            searchText: option.text.toLowerCase().trim(),
            
            //setVisible: null,
            
            visible: false,
            visibleIndex: null, 

            updateHoverIn: null,
            select: null,
            disable: null,

            updateSelectedFalse: null, 
            updateSelectedTrue: null,
            
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
    let newIsSelected = choice.option.selected;
    if (newIsSelected != choice.isOptionSelected)
    {
        if (!choice.isOptionHidden) // TODO - soemthing wrong there
        {
            if (newIsSelected)
                choice.updateSelectedTrue();
            else
                choice.updateSelectedFalse();
        }
    }
}