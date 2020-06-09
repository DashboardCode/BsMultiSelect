export function ChoiceAspect(optionPropertiesAspect){
    return {
        createChoice: (option)=>createChoice(optionPropertiesAspect, option),
        setOptionSelected: (choice, booleanValue) => setOptionSelected(optionPropertiesAspect, choice, booleanValue),
        isSelectable: (choice)=>isSelectable(choice) // TODO: should be moved to new aspect
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

function isSelectable(choice){
    return !choice.isOptionSelected  && !choice.isOptionDisabled;
}

function createChoice(optionPropertiesAspect, option){
    let isOptionSelected = optionPropertiesAspect.getSelected(option);
    let isOptionDisabled = optionPropertiesAspect.getDisabled(option); 
    return {
        option: option,
        
        isOptionSelected: isOptionSelected,
        isOptionDisabled: isOptionDisabled,
        
        updateDisabled: null,
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
        choiceElement: null,
        choiceElementAttach: null,
    
        itemPrev: null,
        itemNext: null,
        
        remove: null,
    
        dispose: null,
    
        isOptionHidden: null
    }
}