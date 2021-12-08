
// no overrides (not an aspect, just )
export function CreateChoiceBaseAspect(optionPropertiesAspect){
    return {
        createChoiceBase(option){
            return {
                // navigation and filter support
                filteredPrev: null, 
                filteredNext: null, 
                searchText: optionPropertiesAspect.getText(option).toLowerCase().trim(), // TODO make an index abstraction

                // internal state handlers, so they do not have "update semantics"
                isHoverIn: false,
                
                setHoverIn: null,
                
                choiceDom:null,
                
                itemPrev: null,
                itemNext: null,
                
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