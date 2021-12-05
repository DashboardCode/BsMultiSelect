// todo: remove?
export function ChoiceClickAspect(optionToggleAspect, filterDom){
    return {
        choiceClick: (wrap) => {
            optionToggleAspect.toggle(wrap);
            filterDom.setFocus();
        }
    }
}

// // fullMatchAspect trySetWrapSelected(fullMatchWrap.option, composeUpdateSelected(fullMatchWrap, true), true);

export function OptionToggleAspect(createPickHandlersAspect, addPickAspect /*, setOptionSelectedAspect*/){
    return {
        toggle: (wrap) => {
            let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            addPickAspect.addPick(wrap, pickHandlers);
            return true; // TODO: process setOptionSelectedAspect
        }
    }
}

export function AddPickAspect(){
    return {
        addPick(wrap, pickHandlers){
            return pickHandlers.producePick();
        }
    }
}

export function FullMatchAspect(createPickHandlersAspect, addPickAspect){
    return {
        fullMatch(wrap){
            let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            addPickAspect.addPick(wrap, pickHandlers);
            return true; // TODO: process setOptionSelectedAspect
        }
    }
}



export function CreateChoiceBaseAspect(optionPropertiesAspect){
    return {
        createChoiceBase(option){
            return {
                    
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
                choiceDom:null,
                choiceElementAttach: null,
                
                itemPrev: null,
                itemNext: null,
                
                remove: null,
                
                dispose: null
            }
        }
    }
}

export function CreateWrapAspect(){
    return {
        createWrap(option){
            return {
                option: option
            }
        }
    }
}