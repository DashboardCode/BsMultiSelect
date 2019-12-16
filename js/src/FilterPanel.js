function defFilterInputStyleSys(s) {s.border='0px'; s.padding='0px'; s.outline='none'; s.backgroundColor='transparent' };

function FilterPanel(
        createElement,
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
        onInput, // filter
        setEmptyLength
    ) {
    
    var inputElement = createElement('INPUT'); 
    
    inputElement.setAttribute("type","search");
    inputElement.setAttribute("autocomplete","off");

    defFilterInputStyleSys(inputElement.style);

    insertIntoDom(inputElement);

    var onfilterInputKeyDown = (event) => {
        if ([38, 40, 13 ,27].indexOf(event.which)>=0 
            || (event.which == 9 && inputElement.value) ) {
            event.preventDefault(); 
            // preventDefault for tab(9) it enables keyup,
            // prevent form default button (13-enter) 
            // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
            // esc(27) there is just in case
        }
        if (event.which == 27 ) {
            onKeyDownEsc(inputElement.value?false:true, event); // support BS do not close modal - event.stopPropagation inside
        }
        else if (event.which == 38) {
            onKeyDownArrowUp();
        }
        else if (event.which == 40) {
            onKeyDownArrowDown();
        }
        else if (event.which == 9  /*tab*/) { // no keydown for this
            if (!inputElement.value) {
                 onTabForEmpty(); // filter is empty, nothing to reset
            }
        }
        else if (event.which == 8 /*backspace*/) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!inputElement.value)
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
        var filterInputValue = inputElement.value;
        onInput(
            filterInputValue, 
            ()=> inputElement.style.width = filterInputValue.length*1.3 + 2 + "ch"
        );
    }
    
    inputElement.addEventListener('focusin', onFocusIn);
    inputElement.addEventListener('focusout', onFocusOut);
    inputElement.addEventListener('keydown', onfilterInputKeyDown);    
    inputElement.addEventListener('keyup', onFilterInputKeyUp);
    inputElement.addEventListener('input', onFilterInputInput);

    // function setEmptyLength(){
    //     inputElement.style.width= "100%"; //--"1rem";
    // }
    //setEmptyLength();

    function setEmpty(){
        inputElement.value ='';
        setEmptyLength();
    };
    
    return {
        inputElement,
        isEmpty(){
            return inputElement.value ? false:true;
        },
        setEmpty,
        setEmptyLength,
        setFocus(){
            inputElement.focus();
        },
        isEventTarget(event){
            return event.target == inputElement;
        },
        dispose(){
            inputElement.removeEventListener('focusin', onFocusIn);
            inputElement.removeEventListener('focusout', onFocusOut);
            inputElement.removeEventListener('keydown', onfilterInputKeyDown);
            inputElement.removeEventListener('keyup', onFilterInputKeyUp);
            inputElement.removeEventListener('input', onFilterInputInput);
        }
    }
}

export default FilterPanel;