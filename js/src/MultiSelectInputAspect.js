function MultiSelectInputAspect (
    window,
    appendToContainer, 
    filterInputItem, 
    picksElement,
    optionsElement, 
    showDropDown,
    hideDropDownAndResetFilter,
    isDropDownMenuEmpty,
    Popper
    ) {

        appendToContainer();
        var document = window.document;

    var skipFocusout = false;
    
    // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container
    var skipoutMousedown = function() {
         skipFocusout = true;
    }

    var documentMouseup = function(event) {
        // if click outside container - close dropdown
        if (  !(optionsElement === event.target 
                || picksElement === event.target 
                || optionsElement.contains(event.target)
                || picksElement.contains(event.target)
               )
            ) {
            hideDropDownAndResetFilter();
        }
    }

    var popper = new Popper( 
        filterInputItem, 
        optionsElement, 
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

            picksElement.addEventListener("mousedown", skipoutMousedown);
            optionsElement.addEventListener("mousedown", skipoutMousedown);
            document.addEventListener("mouseup", documentMouseup);
            
        },
        onDropDownHide(){
            picksElement.removeEventListener("mousedown", skipoutMousedown);
            optionsElement.addEventListener("mousedown", skipoutMousedown);
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