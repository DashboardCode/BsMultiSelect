function defFilterInputStyleSys(s) {s.width='2ch'; s.border='0'; s.padding='0'; s.outline='none'; s.backgroundColor='transparent' };

function FilterPanel(
        insertIntoDom,
        onFilterInputFocusIn,  // show dropdown
        onFilterInputFocusOut, // hide dropdown
        keyDownArrowUp, 
        keyDownArrowDown,
        hideDropDown,  
        removeSelectedTail, // backspace alike
        resetDropDownMenuHover, 
        toggleHovered, // "compleate alike"
        resetFilterAndHideDropDown, // "esc" alike
        input // filter
    ) {
    
    var filterInput = document.createElement('INPUT'); 
    
    filterInput.setAttribute("type","search");
    filterInput.setAttribute("autocomplete","off");

    defFilterInputStyleSys(filterInput.style);

    insertIntoDom(filterInput);

    var onfilterInputKeyDown = (event) => {
        console.log("down "+ event.which);
        if ([38, 40, 13 ,27].indexOf(event.which)>=0 || (event.which == 9 && filterInput.value) ) {
            event.preventDefault(); // for 9 it enables keyup
        }

        if (event.which == 38) {
            keyDownArrowUp();
        }
        else if (event.which == 40) {
            keyDownArrowDown();
        }
        else if (event.which == 9  /*tab*/) { // no keydown for this
            if (!filterInput.value) {
                hideDropDown(); // filter is empty, nothing to reset
            }
        }
        else if (event.which == 8 /*backspace*/) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!filterInput.value)
            { 
                removeSelectedTail();
            }
        }

        if ([38, 40, 13, 9].indexOf(event.which)==-1)
            resetDropDownMenuHover();
    }
   

    
   var onFilterInputKeyUp = (event) => {
        if (event.which == 13 || event.which == 9 ) {
            toggleHovered();
        }
        else if (event.which == 27) { // escape
            resetFilterAndHideDropDown();
        }
    }
    
    // it can be initated by 3PP functionality
    // sample (1) BS functionality - input x button click - clears input
    // sample (2) BS functionality - esc keydown - clears input
    // and there could be difference in processing: (2) should hide the menu, then reset , when (1) should just reset without hiding.
    var onFilterInputInput = () => {
        var filterInputValue = filterInput.value;
        input(
            filterInputValue, 
            ()=> filterInput.style.width = filterInputValue.length*1.3 + 2 + "ch"
        );
    }
    
    var setEmptyLength =() =>{
        filterInput.style.width="2ch";
    }
    var setEmpty= ()=> {
        filterInput.value ='';
        setEmptyLength();
    };

    filterInput.addEventListener('focusin', onFilterInputFocusIn);
    filterInput.addEventListener('focusout', onFilterInputFocusOut);
    filterInput.addEventListener('keydown', onfilterInputKeyDown);    
    filterInput.addEventListener('keyup', onFilterInputKeyUp);
    filterInput.addEventListener('input', onFilterInputInput);

    var filterPanel = {
        input:filterInput,
        isEmpty(){
            return filterInput.value ? false:true;
        },
        setEmpty,
        setEmptyLength,
        setFocus(){
            filterInput.focus();
        },
        isEventTarget(event){
            return event.target == filterInput;
        },
        dispose(){
            filterInput.removeEventListener('focusin', onFilterInputFocusIn);
            filterInput.removeEventListener('focusout', onFilterInputFocusOut);
            filterInput.removeEventListener('keydown', onfilterInputKeyDown);
            filterInput.removeEventListener('keyup', onFilterInputKeyUp);
            filterInput.removeEventListener('input', onFilterInputInput);
        }
    }
    return filterPanel;
}

export default FilterPanel;
