function MultiSelectInputAspect (
    window,
    document, 
    container, 
    selectedPanel, 
    filterInputItem, 
    dropDownMenu, 
    showDropDown,
    hideDropDownAndResetFilter,
    isDropDownMenuEmpty,
    Popper
    ) {

    container.appendChild(selectedPanel);
    container.appendChild(dropDownMenu);

    var skipFocusout = false;
    
    // we want to escape the closing of the menu on a user's click inside the container
    var containerMousedown = function() {
         skipFocusout = true;
    }

    var documentMouseup = function(event) {
        // if click outside container - close dropdown
        if (!(container === event.target || container.contains(event.target))) {
            hideDropDownAndResetFilter();
        }
    }

    var popper = new Popper( 
        filterInputItem, 
        dropDownMenu, 
        {
            placement: 'bottom-start',
            modifiers: {
                preventOverflow: {enabled:false},
                hide: {enabled:false},
                flip: {enabled:false}
            }
        }
    );

    var filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)
    var preventDefaultClickEvent = null;

    function alignAndShowDropDown(event){
        if (preventDefaultClickEvent != event) {
            if (!isDropDownMenuEmpty())
            {
                alignToFilterInputItemLocation(true);
                showDropDown();
            }
        }
        preventDefaultClickEvent=null;
    }
    
    function alignToFilterInputItemLocation(force) {
        let offsetLeft = filterInputItem.offsetLeft;
        if (force || filterInputItemOffsetLeft != offsetLeft){ // position changed
            popper.update();
            filterInputItemOffsetLeft = offsetLeft;
        }
    }

    return {
        dispose(){
            popper.destroy();
        },
        alignToFilterInputItemLocation,
        alignAndShowDropDown,
        processUncheck(uncheckOption, event){
            // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
            // never remove elements in the same event iteration

            window.setTimeout(()=>uncheckOption(),0)
            preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
        },
        onDropDownShow(){
            // add listeners that manages close dropdown on input's focusout and click outside container
            //container.removeEventListener("mousedown", containerMousedown);

            container.addEventListener("mousedown", containerMousedown);
            document.addEventListener("mouseup", documentMouseup);
            
        },
        onDropDownHide(){
            container.removeEventListener("mousedown", containerMousedown);
            document.removeEventListener("mouseup", documentMouseup);
        },
        getSkipFocusout : function() {
             return skipFocusout;
        },
        resetSkipFocusout : function() {
             skipFocusout=false;
        }
    }
}

export default MultiSelectInputAspect;