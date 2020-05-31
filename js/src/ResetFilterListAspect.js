export function ResetFilterListAspect(filterDom, filterListAspect){
    return {
        forceResetFilter(){  // over in PlaceholderPlugin
            filterDom.setEmpty();
            filterListAspect.processEmptyInput(); // over in PlaceholderPlugin
        }
    }
}

export function ManageableResetFilterListAspect(filterDom, resetFilterListAspect){
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

