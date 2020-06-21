export function ResetFilterListAspect(filterDom, filterManagerAspect){
    return {
        forceResetFilter(){  // over in PlaceholderPlugin
            filterDom.setEmpty();
            filterManagerAspect.processEmptyInput(); // over in PlaceholderPlugin
        }
    }
}

export function ResetFilterAspect(filterDom, resetFilterListAspect){
    return {
        resetFilter(){ // call in OptionsApiPlugin
            if (!filterDom.isEmpty())  // call in Placeholder
                resetFilterListAspect.forceResetFilter(); // over in Placeholder
        }
    }
}

export function FocusInAspect(picksDom){
    return {
        setFocusIn(focus){ // call in OptionsApiPlugin
            picksDom.setIsFocusIn(focus) // unique call, call BsAppearancePlugin
            picksDom.toggleFocusStyling() // over BsAppearancePlugin
        }
    }
}

