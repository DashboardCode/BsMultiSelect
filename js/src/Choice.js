export function Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden){
    return {
            option: option,
            isOptionDisabled: isOptionDisabled,
            isOptionHidden: isOptionHidden,
            isOptionSelected: isOptionSelected,

            searchText: option.text.toLowerCase().trim(),
            excludedFromSearch: isOptionSelected || isOptionDisabled || isOptionHidden,

            hoverIn: null,
            select: null,
            disable: null,
            dispose: null,
            setVisible: null,
            setChoiceSelectedFalse: null,
            setChoiceSelectedTrue: null,
            //setSelectedTrue: null, // TODO remove / replace with this.setOptionSelected
            //setSelectedFalse: null, // TODO remove / replace with this.setOptionSelected
            resetCandidateToHoveredMultiSelectData: null, // todo: setCandidateToHovered(Boolean) ?
            visible: false,
            visibleIndex: null // todo: check for errors
    }
}

export function setOptionSelectedTrue(choice, setSelected){
    let value = false;
    var confirmed = setSelected(choice.option, true);
    if (!(confirmed===false)) {
        choice.setChoiceSelectedTrue();
        value = true;
    }
    return value;
}

export function setOptionSelectedFalse(choice, setSelected){
    let value = false;
    var confirmed = setSelected(choice.option, false);
    if (!(confirmed===false)) {
        choice.setChoiceSelectedFalse();
        value = true;
    }
    return value;
}

export function toggleOptionSelected(choice, setSelected){
    let value =false;
    if (choice.isOptionSelected)
        value = setOptionSelectedFalse(choice, setSelected);
    else
        if (!choice.isOptionDisabled )
            value = setOptionSelectedTrue(choice, setSelected);
    return value;
}


