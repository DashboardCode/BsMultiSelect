export function Choice(option, isOptionSelected, isOptionDisabled){
    let choice = {
        option: option,
        
        isOptionSelected: isOptionSelected,
        isOptionDisabled: isOptionDisabled,
        
        updateDisabled: null,
        updateSelected: null,

        // navigation and filter support
        filteredPrev: null, 
        filteredNext: null, 
        searchText: option.text.toLowerCase().trim(), // TODO make an index abstraction

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
    return choice;
}

export function dispose(choice) {
    choice.choiceElement = null;
    choice.choiceElementAttach = null;
    
    choice.updateSelected = null;
    choice.updateDisabled = null;

    // not real data manipulation but internal state
    choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
    choice.setHoverIn = null;
    
    choice.dispose = null;
}