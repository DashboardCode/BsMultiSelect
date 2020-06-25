export function IsChoiceSelectableAspect(){
    return {
        isSelectable: (wrap)=>!wrap.isOptionSelected
    }
}

export function SetOptionSelectedAspect(optionPropertiesAspect){
    return {
        setOptionSelected: (wrap, booleanValue) => {
            let success = false;
            var confirmed = optionPropertiesAspect.setSelected(wrap.option, booleanValue);
            if (!(confirmed===false)) {
                wrap.isOptionSelected = booleanValue;
                wrap.updateSelected();
                success = true;
            }
            return success;
        }
    }
}

export function CreateChoiceAspect(optionPropertiesAspect){
    return {
        createChoice: (option)=>createChoice(optionPropertiesAspect, option),
    }
}


function createChoice(optionPropertiesAspect, option){
    let isOptionSelected = optionPropertiesAspect.getSelected(option);
    return {
        option: option,
        isOptionSelected: isOptionSelected,
        isOptionHidden: null,
        isOptionDisabled: null,
        updateSelected: null,
        choice: {
            
            //updateDisabled:null,  
            //updateHidden:null,
            
            // navigation and filter support
            filteredPrev: null, 
            filteredNext: null, 
            searchText: optionPropertiesAspect.getText(option).toLowerCase().trim(), // TODO make an index abstraction
            
            // internal state handlers, so they do not have "update semantics"
            isHoverIn: false,
            isFilteredIn: false,
            
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
        }
    }
}