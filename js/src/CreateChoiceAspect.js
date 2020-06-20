export function IsChoiceSelectableAspect(){
    return {
        isSelectable: (choice)=>!choice.isOptionSelected
    }
}

export function SetOptionSelectedAspect(optionPropertiesAspect){
    return {
        setOptionSelected: (choice, booleanValue) => setOptionSelected(optionPropertiesAspect, choice, booleanValue),
    }
}

export function CreateChoiceAspect(optionPropertiesAspect){
    return {
        createChoice: (option)=>createChoice(optionPropertiesAspect, option),
    }
}

function setOptionSelected(optionPropertiesAspect, choice, booleanValue){
    let success = false;
    var confirmed = optionPropertiesAspect.setSelected(choice.option, booleanValue);
    if (!(confirmed===false)) {
        choice.isOptionSelected = booleanValue;
        choice.updateSelected();
        success = true;
    }
    return success;
}

function createChoice(optionPropertiesAspect, option){
    let isOptionSelected = optionPropertiesAspect.getSelected(option);
    return {
        option: option,
        isOptionSelected: isOptionSelected,

        updateSelected: null,
    
        // navigation and filter support
        filteredPrev: null, 
        filteredNext: null, 
        searchText: optionPropertiesAspect.getText(option).toLowerCase().trim(), // TODO make an index abstraction
    
        // internal state handlers, so they do not have "update semantics"
        isHoverIn: false,
        isFilterIn: false,
    
        setVisible: null,
        setHoverIn: null,
    
        // TODO: is it a really sense to have them there?
        isChoiceElementAttached: false,
        choiceElement: null,
        choiceElementAttach: null,
    
        itemPrev: null,
        itemNext: null,
        
        remove: null,
    
        dispose: null,
    
        isOptionHidden: null
    }
}