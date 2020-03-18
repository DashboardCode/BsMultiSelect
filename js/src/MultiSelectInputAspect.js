import {EventBinder, EventLoopFlag, containsAndSelf} from './ToolsDom'

export function MultiSelectInputAspect (
    window,
    appendToContainer, 
    filterInputElement, 
    picksElement,
    choicesElement, 
    isChoicesVisible,
    setChoicesVisible,
    resetHoveredChoice, 
    hoverIn,
    resetFilter,
    isChoiceEmpty,
    onClick,
    isRtl,
    Popper
    ) 
{
    appendToContainer();
    var document = window.document;
    var eventLoopFlag = EventLoopFlag(window); // showChoices
    var skipFocusout = false;

    // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container
    var skipoutMousedown = function() {
         skipFocusout = true;
    }

    var documentMouseup = function(event) {
        // if click outside container - close dropdown
        if ( !containsAndSelf(choicesElement, event.target) && !containsAndSelf(picksElement, event.target)) {
            hideChoices();
            resetFilter();
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
            if (isChoicesVisible()){
                hideChoices()
            }else {
                if (!isChoiceEmpty())
                {
                    alignToFilterInputItemLocation(true);
                    showChoices();
                }
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
            eventLoopFlag.set();
            setChoicesVisible(true);
            
            // add listeners that manages close dropdown on input's focusout and click outside container
            //container.removeEventListener("mousedown", containerMousedown);

            picksElement.addEventListener("mousedown", skipoutMousedown);
            choicesElement.addEventListener("mousedown", skipoutMousedown);
            document.addEventListener("mouseup", documentMouseup);
        }
    }

    function hideChoices() {
        resetMouseCandidateChoice();
        resetHoveredChoice();
        if (isChoicesVisible())
        {
            setChoicesVisible(false);
            
            picksElement.removeEventListener("mousedown", skipoutMousedown);
            choicesElement.removeEventListener("mousedown", skipoutMousedown);
            document.removeEventListener("mouseup", documentMouseup);
        }
    }
    function processUncheck(uncheckOption, event){
        // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
        // never remove elements in the same event iteration

        window.setTimeout(()=>uncheckOption(),0)
        preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
    }

    function handleOnRemoveButton(onRemove, setSelectedFalse){
        // processRemoveButtonClick removes the item
        // what is a problem with calling 'remove' directly (not using  setTimeout('remove', 0)):
        // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
        // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
        // because of the event's bubling process 'remove' runs first. 
        // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
        // before we could analize is it belong to our dropdown or not.
        // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
        // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
        // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
        // the situation described above: click outside dropdown on the same component.
        // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target 
        // that belomgs to DOM (e.g. panel)
        let processRemoveButtonClick = (event) => {
            processUncheck(setSelectedFalse, event);
            hideChoices();
            resetFilter(); 
        };
        onRemove(event => {
            processRemoveButtonClick(event);
        });
    }
    
    let mouseCandidateEventBinder = EventBinder();
    var resetMouseCandidateChoice = () => {
        mouseCandidateEventBinder.unbind();
    };

    var mouseOverToHoveredAndReset = (choice) => {
        if (!choice.isHoverIn)
            hoverIn(choice);
        resetMouseCandidateChoice();
    };

    function adoptChoiceElement(choice, choiceElement){

        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onChoiceElementMouseover = () => 
        {
            if (eventLoopFlag.get())
            {
                resetMouseCandidateChoice();
                mouseCandidateEventBinder.bind(choiceElement, 'mousemove', ()=>mouseOverToHoveredAndReset(choice));
                mouseCandidateEventBinder.bind(choiceElement, 'mousedown', ()=>mouseOverToHoveredAndReset(choice));
            }
            else
            {
                if (!choice.isHoverIn)
                {
                    // NOTE: mouseleave is not enough to guarantee remove hover styles in situations
                    // when style was setuped without mouse (keyboard arrows)
                    // therefore force reset manually (done inside hoverIn)
                    hoverIn(choice);
                }                
            }
        }
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onChoiceElementMouseleave = () => {
            if (!eventLoopFlag.get()) {
                resetHoveredChoice();
            }
        }
        var overAndLeaveEventBinder = EventBinder();
        overAndLeaveEventBinder.bind(choiceElement, 'mouseover', onChoiceElementMouseover);
        overAndLeaveEventBinder.bind(choiceElement, 'mouseleave', onChoiceElementMouseleave);

        return overAndLeaveEventBinder.unbind;
    }

    return {
        adoptChoiceElement,
        dispose(){
            resetMouseCandidateChoice();
            popper.destroy();
            componentDisabledEventBinder.unbind();
        },
        alignToFilterInputItemLocation,
        
        getSkipFocusout() {
             return skipFocusout;
        },
        resetSkipFocusout() {
             skipFocusout=false;
        },
        disable(isComponentDisabled){
            if (isComponentDisabled)
                componentDisabledEventBinder.unbind();
            else
                componentDisabledEventBinder.bind(picksElement, "click", event => {
                    onClick(event);
                    alignAndShowChoices(event);
                });  // OPEN dropdown
        },
        eventLoopFlag,
        hideChoices,
        showChoices,
        handleOnRemoveButton
    }
}