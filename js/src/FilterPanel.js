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
        stopEscKeyDownPropogation, 
        onKeyUpEsc, // "esc" alike
        onInput//, // filter
){
    filterInputElement.setAttribute("type","search");
    filterInputElement.setAttribute("autocomplete","off");

    var isEmpty = ()=>{
        return filterInputElement.value ? false:true;
    }
    var onfilterInputKeyDown = (event) => {
        let keyCode = event.which;
        var empty = isEmpty();
        if ([38, 40, 13 ,27].indexOf(keyCode)>=0 
            || (keyCode == 9 && !empty) ) {
            event.preventDefault(); 
            // NOTE: prevention there enables handling on keyup otherwice there are no keyup (true at least for '9-tab'),
            // '13-enter'  - prevention against form's default button 
            // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
            // '27-esc' there is "just in case"
        }
        if (keyCode == 27 ) {
            if (!empty  || stopEscKeyDownPropogation())
                event.stopPropagation()
                //onKeyDownEsc(empty, event); // support BS do not close modal - event.stopPropagation inside
        }
        else if (keyCode == 38) {
            onKeyDownArrowUp();
        }
        else if (keyCode == 40) {
            onKeyDownArrowDown();
        }
        else if (keyCode == 9  /*tab*/) { // no keydown for this
            if (empty) {
                 onTabForEmpty(); // filter is empty, nothing to reset
            }
        }
        else if (keyCode == 8 /*backspace*/) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (empty) {
                onBackspace();
            }
        }
    }
    
    var onFilterInputKeyUp = (event) => {
        let keyCode = event.which;
        if (keyCode == 9) {
            onTabToCompleate();
        }
        else if (keyCode == 13 ){
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
    eventBinder.bind(filterInputElement,'focusin', onFocusIn);
    eventBinder.bind(filterInputElement,'focusout', onFocusOut);
    eventBinder.bind(filterInputElement,'input', onFilterInputInput);
    eventBinder.bind(filterInputElement,'keydown', onfilterInputKeyDown);    
    eventBinder.bind(filterInputElement,'keyup', onFilterInputKeyUp);

    return {
        isEmpty,
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
            eventBinder.unbind();
        }
    }
}