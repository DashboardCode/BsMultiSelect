import {EventBinder, EventSkipper} from './ToolsDom'

export function MultiSelectInputAspect (
    window,
    appendToContainer, 
    filterInputElement, 
    picksElement,
    choicesElement, 
    isChoicesVisible,
    setChoicesVisible,
    resetCandidateToHoveredMultiSelectData,
    hideChoicesAndResetFilter,
    isChoiceEmpty,
    onClick,
    isRtl,
    Popper
    ) 
{
    appendToContainer();
    var document = window.document;
    var eventSkipper = EventSkipper(window);
    var skipFocusout = false;

    // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container
    var skipoutMousedown = function() {
         skipFocusout = true;
    }

    var documentMouseup = function(event) {
        // if click outside container - close dropdown
        if (  !(choicesElement === event.target 
                || picksElement === event.target 
                || choicesElement.contains(event.target)
                || picksElement.contains(event.target)
               )
            ) {
            hideChoicesAndResetFilter();
        }
    }

    var popper = null;
    //if (!!Popper.prototype && !!Popper.prototype.constructor.name) {
        popper=new Popper( 
            filterInputElement, 
            choicesElement, {
                placement: isRtl?'bottom-end':'bottom-start',
                modifiers: {
                    preventOverflow: {enabled:false},
                    hide: {enabled:false},
                    flip: {enabled:false}
                }
            }
        );
    /*}else{
        popper=Popper.createPopper(
            filterInputElement,
            choicesElement,
            //  https://github.com/popperjs/popper.js/blob/next/docs/src/pages/docs/modifiers/prevent-overflow.mdx#mainaxis
            // {
            //     placement: isRtl?'bottom-end':'bottom-start',
            //     modifiers: {
            //         preventOverflow: {enabled:false},
            //         hide: {enabled:false},
            //         flip: {enabled:false}
            //     }
            // }
        );
    }*/

    var filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)
    var preventDefaultClickEvent = null;

    function alignAndShowChoices(event){
        if (preventDefaultClickEvent != event) {
            if (!isChoiceEmpty())
            {
                alignToFilterInputItemLocation(true);
                showChoices();
            }
        }
        preventDefaultClickEvent=null;
    }
    
    function alignToFilterInputItemLocation(force) {
        let offsetLeft = filterInputElement.offsetLeft;
        if (force || filterInputItemOffsetLeft != offsetLeft){ // position changed
            popper.update();
            filterInputItemOffsetLeft = offsetLeft;
        }
    }
    var componentDisabledEventBinder = EventBinder();


    function showChoices() {
        if ( !isChoicesVisible() )
        {
            eventSkipper.setSkippable();
            setChoicesVisible(true);
            
            // add listeners that manages close dropdown on input's focusout and click outside container
            //container.removeEventListener("mousedown", containerMousedown);

            picksElement.addEventListener("mousedown", skipoutMousedown);
            choicesElement.addEventListener("mousedown", skipoutMousedown);
            document.addEventListener("mouseup", documentMouseup);
        }
    }

    function hideChoices() {
        resetCandidateToHoveredMultiSelectData();
        if (isChoicesVisible())
        {
            setChoicesVisible(false);
            
            picksElement.removeEventListener("mousedown", skipoutMousedown);
            choicesElement.addEventListener("mousedown", skipoutMousedown);
            document.removeEventListener("mouseup", documentMouseup);
        }
    }
    function processUncheck(uncheckOption, event){
        // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
        // never remove elements in the same event iteration

        window.setTimeout(()=>uncheckOption(),0)
        preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
    }
    return {
        dispose(){
            popper.destroy();
            componentDisabledEventBinder.unbind();
        },
        alignToFilterInputItemLocation,
        
        getSkipFocusout : function() {
             return skipFocusout;
        },
        resetSkipFocusout : function() {
             skipFocusout=false;
        },
        disable(isComponentDisabled){
            if (isComponentDisabled)
                componentDisabledEventBinder.unbind();
            else
                componentDisabledEventBinder.bind(picksElement,"click", event => {
                    onClick(event);
                    alignAndShowChoices(event);
                });  // OPEN dropdown
        },
        eventSkipper,
        hideChoices,
        showChoices,
        processRemoveButtonClick(removePick, event){
            processUncheck(removePick, event);
            hideChoices(); // always hide 1st
        }
        //,
        //getIsVisbleDropDown
    }
}