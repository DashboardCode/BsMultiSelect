import {EventBinder} from './ToolsDom';
export function FilterPanel(
        filterInputElement,

        onFocusIn,  // show dropdown
        onFocusOut, // hide dropdown
        onKeyDownArrowUp, 
        onKeyDownArrowDown,
        onTabForEmpty,  // tab on empty
        onBackspace, // backspace alike
        
        onTabToCompleate, // "compleate alike"
        onEnterToCompleate,
        onKeyUpEsc, // "esc" alike

        stopEscKeyDownPropogation, 
        
        onInput // filter
){
    var isEmpty = () => filterInputElement.value ? false:true;

    var onfilterInputKeyDown = (event) => {
        let keyCode = event.which;
        var empty = isEmpty();

        if ([ 13,
              27  // '27-esc' there is "just in case", I can imagine that there are user agents that do UNDO
            ].indexOf(keyCode)>=0 
            || (keyCode == 9 && !empty) //  otherwice there are no keyup (true at least for '9-tab'),
            ) {
            event.preventDefault(); 
            
            // '13-enter'  - prevention against form's default button 
            // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
        }

        if ([ 38, 40 ].indexOf(keyCode) >= 0 )
            event.preventDefault(); 

        if (keyCode == 8 /*backspace*/) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // let isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (empty) {
                onBackspace();
            }
        }
        // ---------------------------------------------------------------------------------
        // NOTE: no preventDefault called in case of empty for 9-tab
        else if (keyCode == 9  /*tab*/) { // NOTE: no keydown for this (without preventDefaul after TAB keyup event will be targeted another element)  
            if (empty) { 
                 onTabForEmpty();  // hideChoices inside (and no filter reset since it is empty) 
            }
        }
        else if (keyCode == 27 /*esc*/ ) { // NOTE: forbid the ESC to close the modal (in case the nonempty or dropdown is open)
        
            if (!empty  || stopEscKeyDownPropogation())
                event.stopPropagation()
        }
        else if (keyCode == 38) {
            onKeyDownArrowUp();
        }
        else if (keyCode == 40) {
            onKeyDownArrowDown();
        }
    }
    
    var onFilterInputKeyUp = (event) => {
        let keyCode = event.which;
        //var handler = keyUp[event.which/* key code */];
        //handler();

        if (keyCode == 9) {
            onTabToCompleate();
        }
        else if (keyCode == 13 ) {
            onEnterToCompleate();
        }
        else if (keyCode == 27) { // escape
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
            ()=> {filterInputElement.style.width = filterInputValue.length*1.3 + 2 + "ch"} // TODO: better width calculation
        );
    }
    
    var eventBinder = EventBinder();
    eventBinder.bind(filterInputElement,'focusin',  onFocusIn);
    eventBinder.bind(filterInputElement,'focusout', onFocusOut);
    eventBinder.bind(filterInputElement,'input',    onFilterInputInput);
    eventBinder.bind(filterInputElement,'keydown',  onfilterInputKeyDown);    
    eventBinder.bind(filterInputElement,'keyup',    onFilterInputKeyUp);

    return {
        dispose(){
            eventBinder.unbind();
        }
    }
}