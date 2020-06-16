import {EventBinder, EventLoopFlag, containsAndSelf} from './ToolsDom'

export function MultiSelectInputAspect (
    window,
    setFocus, 
    picksElement,
    choicesElement, 
    isChoicesVisible,
    setChoicesVisible,
    resetHoveredChoice, 
    hoverIn,
    resetFilter,
    isChoicesListEmpty,
    onClick,
    resetFocus,
    alignToFilterInputItemLocation
    ) 
{
    var document = window.document;
    var eventLoopFlag = EventLoopFlag(window); 
    var skipFocusout = false;
    
    function getSkipFocusout() {
        return skipFocusout;
    };
    function resetSkipFocusout() {
        skipFocusout = false;
    };
    function setSkipFocusout() {
        skipFocusout = true;
    };

    // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container
    var skipoutMousedown = function() {
        setSkipFocusout();
    }

    var documentMouseup = function(event) {
        // if we would left without focus then "close the drop" do not remove focus border
        if (choicesElement == event.target) 
            setFocus()

        // if click outside container - close dropdown
        else if ( !containsAndSelf(choicesElement, event.target) && !containsAndSelf(picksElement, event.target)) {
            hideChoices();
            resetFilter();
            resetFocus();
        }
    }

    var preventDefaultClickEvent = null;

    var componentDisabledEventBinder = EventBinder();

    // TODO: remove setTimeout: set on start of mouse event reset on end
    function skipoutAndResetMousedown(){
        skipoutMousedown();
        window.setTimeout(()=>resetSkipFocusout());
    }
    picksElement.addEventListener("mousedown", skipoutAndResetMousedown);

    function showChoices() {
        if ( !isChoicesVisible() )
        {
            alignToFilterInputItemLocation();
            eventLoopFlag.set();
            setChoicesVisible(true);
            
            // add listeners that manages close dropdown on  click outside container
            choicesElement.addEventListener("mousedown", skipoutMousedown);
            document.addEventListener("mouseup", documentMouseup);
        }
    }

    function clickToShowChoices(event){
        onClick(event);
        if (preventDefaultClickEvent != event) {
            if (isChoicesVisible()){
                hideChoices()
            } else {
                if (!isChoicesListEmpty())
                    showChoices();
            }
        }
        preventDefaultClickEvent=null;
    }

    function hideChoices() {
        resetMouseCandidateChoice();
        resetHoveredChoice();
        if (isChoicesVisible())
        {
            setChoicesVisible(false);
            
            choicesElement.removeEventListener("mousedown", skipoutMousedown);
            document.removeEventListener("mouseup", documentMouseup);
        }
    }

    function processUncheck(uncheckOption, event){
        // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
        // never remove elements in the same event iteration

        window.setTimeout(()=>uncheckOption())
        preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
    }

    // function handleOnRemoveButton(onRemove, setSelectedFalse){
    //     // processRemoveButtonClick removes the item
    //     // what is a problem with calling 'remove' directly (not using  setTimeout('remove', 0)):
    //     // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
    //     // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
    //     // because of the event's bubling process 'remove' runs first. 
    //     // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
    //     // before we could analize is it belong to our dropdown or not.
    //     // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
    //     // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
    //     // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
    //     // the situation described above: click outside dropdown on the same component.
    //     // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target 
    //     // that belomgs to DOM (e.g. panel)


    //     onRemove(event => {
    //         processUncheck(setSelectedFalse, event);
    //         hideChoices();
    //         resetFilter(); 
    //     });
    // }
    
    function handleOnRemoveButton(setSelectedFalse){ return (event) => {
        processUncheck(setSelectedFalse, event);
        hideChoices();
        resetFilter(); 
    }}
    
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
            picksElement.removeEventListener("mousedown", skipoutAndResetMousedown);
            componentDisabledEventBinder.unbind();
        },
        onFocusOut(action){
            if (!getSkipFocusout()){ // skip initiated by mouse click (we manage it different way)
                hideChoices();
                resetFilter(); // if do not do this we will return to filtered list without text filter in input
                action();
            }
            resetSkipFocusout();
        },
        disable(isComponentDisabled){
            if (isComponentDisabled)
                componentDisabledEventBinder.unbind();
            else
                componentDisabledEventBinder.bind(picksElement, "click",  clickToShowChoices); 
        },
        eventLoopFlag,
        hideChoices,
        showChoices,
        handleOnRemoveButton
    }
}