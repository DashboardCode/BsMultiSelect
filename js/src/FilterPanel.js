export function FilterPanel(
        filterInputElement,
        insertIntoDom,
        onFocusIn,  // show dropdown
        onFocusOut, // hide dropdown
        onKeyDownArrowUp, 
        onKeyDownArrowDown,
        onTabForEmpty,  // tab on empty
        onBackspace, // backspace alike
        onEnterOrTabToCompleate, // "compleate alike"
        onKeyDownEsc, 
        onKeyUpEsc, // "esc" alike
        onInput//, // filter
    ){
        filterInputElement.setAttribute("type","search");
        filterInputElement.setAttribute("autocomplete","off");

        //setStyle(filterInputElement, filterInputStyle);

        insertIntoDom();

        var onfilterInputKeyDown = (event) => {
        if ([38, 40, 13 ,27].indexOf(event.which)>=0 
            || (event.which == 9 && filterInputElement.value) ) {
            event.preventDefault(); 
            // preventDefault for tab(9) it enables keyup,
            // prevent form default button (13-enter) 
            // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
            // esc(27) there is just in case
        }
        if (event.which == 27 ) {
            onKeyDownEsc(filterInputElement.value?false:true, event); // support BS do not close modal - event.stopPropagation inside
        }
        else if (event.which == 38) {
            onKeyDownArrowUp();
        }
        else if (event.which == 40) {
            onKeyDownArrowDown();
        }
        else if (event.which == 9  /*tab*/) { // no keydown for this
            if (!filterInputElement.value) {
                 onTabForEmpty(); // filter is empty, nothing to reset
            }
        }
        else if (event.which == 8 /*backspace*/) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!filterInputElement.value)
            { 
                onBackspace();
            }
        }
    }
    
    var onFilterInputKeyUp = (event) => {
        if (event.which == 13 || event.which == 9) {
            onEnterOrTabToCompleate();
        }
        else if (event.which == 27) { // escape
            onKeyUpEsc(); // is it always empty (bs x can still it) 
        }
    }
    
    // it can be initated by 3PP functionality
    // sample (1) BS functionality - input x button click - clears input
    // sample (2) BS functionality - esc keydown - clears input
    // and there could be difference in processing: (2) should hide the menu, then reset , when (1) should just reset without hiding.
    var onFilterInputInput = () => {
        var filterInputValue = filterInputElement.value;
        onInput(
            filterInputValue, 
            ()=> {filterInputElement.style.width = filterInputValue.length*1.3 + 2 + "ch"}
        );
    }
    
    filterInputElement.addEventListener('focusin', onFocusIn);
    filterInputElement.addEventListener('focusout', onFocusOut);
    filterInputElement.addEventListener('keydown', onfilterInputKeyDown);    
    filterInputElement.addEventListener('keyup', onFilterInputKeyUp);
    filterInputElement.addEventListener('input', onFilterInputInput);

    return {
        isEmpty(){
            return filterInputElement.value ? false:true;
        },
        setEmpty(){
            filterInputElement.value ='';
        },
        setFocus(){
            filterInputElement.focus();
        },
        isEventTarget(event){
            return event.target == filterInputElement;
        },
        dispose(){
            filterInputElement.removeEventListener('focusin', onFocusIn);
            filterInputElement.removeEventListener('focusout', onFocusOut);
            filterInputElement.removeEventListener('keydown', onfilterInputKeyDown);
            filterInputElement.removeEventListener('keyup', onFilterInputKeyUp);
            filterInputElement.removeEventListener('input', onFilterInputInput);
        }
    }
}