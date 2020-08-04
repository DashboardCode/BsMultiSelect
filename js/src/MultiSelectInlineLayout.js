import {composeSync} from './ToolsJs';
import {EventBinder, EventLoopFlag, containsAndSelf} from './ToolsDom'

export function MultiSelectInlineLayout (
    aspects
    ) 
{
    let {environment,filterDom,picksDom,choicesDom, 
        popupAspect, hoveredChoiceAspect, navigateAspect,filterManagerAspect,
        focusInAspect, optionToggleAspect,
        createPickHandlersAspect,
        inputAspect, picksList, buildChoiceAspect, 
        setDisabledComponentAspect, resetLayoutAspect,
        addPickAspect
    } = aspects;

    let picksElement = picksDom.picksElement;
    let choicesElement = choicesDom.choicesElement;

    var window = environment.window;
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
            filterDom.setFocus()

        // if click outside container - close dropdown
        else if ( !containsAndSelf(choicesElement, event.target) && !containsAndSelf(picksElement, event.target)) {
            resetLayoutAspect.resetLayout();
            focusInAspect.setFocusIn(false);
        }
    }

    function showChoices() {
        if ( !popupAspect.isChoicesVisible() )
        {
            popupAspect.updatePopupLocation();
            eventLoopFlag.set();
            popupAspect.setChoicesVisible(true);
            
            // add listeners that manages close dropdown on  click outside container
            choicesElement.addEventListener("mousedown", skipoutMousedown);
            document.addEventListener("mouseup", documentMouseup);
        }
    }

    function hideChoices() {
        resetMouseCandidateChoice();
        hoveredChoiceAspect.resetHoveredChoice();
        if (popupAspect.isChoicesVisible())
        {
            popupAspect.setChoicesVisible(false);
            
            choicesElement.removeEventListener("mousedown", skipoutMousedown);
            document.removeEventListener("mouseup", documentMouseup);
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

    function clickToShowChoices(event){
        filterDom.setFocusIfNotTarget(event.target);
        if (preventDefaultClickEvent != event) {
            if (popupAspect.isChoicesVisible()){
                hideChoices()
            } else {
                if (filterManagerAspect.getNavigateManager().getCount()>0)
                    showChoices();
            }
        }
        preventDefaultClickEvent=null;
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
    //         resetFilterAspect.resetFilter(); 
    //     });
    // }
    
    function handleOnRemoveButton(setSelectedFalse){ return (event) => {
        processUncheck(setSelectedFalse, event);
        resetLayoutAspect.resetLayout(); 
    }}
    
    let mouseCandidateEventBinder = EventBinder();
    var resetMouseCandidateChoice = () => {
        mouseCandidateEventBinder.unbind();
    };

    var mouseOverToHoveredAndReset = (wrap) => {
        if (!wrap.choice.isHoverIn)
            navigateAspect.hoverIn(wrap);
        resetMouseCandidateChoice();
    };
 
    function adoptChoiceElement(wrap){
        let choiceElement = wrap.choice.choiceElement;
        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onChoiceElementMouseover = () => 
        {
            if (eventLoopFlag.get())
            {
                resetMouseCandidateChoice();
                mouseCandidateEventBinder.bind(choiceElement, 'mousemove', ()=>mouseOverToHoveredAndReset(wrap));
                mouseCandidateEventBinder.bind(choiceElement, 'mousedown', ()=>mouseOverToHoveredAndReset(wrap));
            }
            else
            {
                if (!wrap.choice.isHoverIn)
                {
                    // NOTE: mouseleave is not enough to guarantee remove hover styles in situations
                    // when style was setuped without mouse (keyboard arrows)
                    // therefore force reset manually (done inside hoverIn)
                    navigateAspect.hoverIn(wrap);
                }                
            }
        }
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onChoiceElementMouseleave = () => {
            if (!eventLoopFlag.get()) {
                hoveredChoiceAspect.resetHoveredChoice();
            }
        }
        var overAndLeaveEventBinder = EventBinder();
        overAndLeaveEventBinder.bind(choiceElement, 'mouseover',  onChoiceElementMouseover);
        overAndLeaveEventBinder.bind(choiceElement, 'mouseleave', onChoiceElementMouseleave);

        return overAndLeaveEventBinder.unbind;
    }

    
    filterDom.onFocusIn(()=>focusInAspect.setFocusIn(true));
    filterDom.onFocusOut(() => { 
            if (!getSkipFocusout()){ // skip initiated by mouse click (we manage it different way)
                resetLayoutAspect.resetLayout(); // if do not do this we will return to filtered list without text filter in input
                focusInAspect.setFocusIn(false);
            }
            resetSkipFocusout();
        }
    );

    // it can be initated by 3PP functionality
    // sample (1) BS functionality - input x button click - clears input
    // sample (2) BS functionality - esc keydown - clears input
    // and there could be difference in processing: (2) should hide the menu, then reset , when (1) should just reset without hiding.

    function afterInput(){
        eventLoopFlag.set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

        let visibleCount = filterManagerAspect.getNavigateManager().getCount();

        if (visibleCount>0){
            let panelIsVisble = popupAspect.isChoicesVisible();
            if (!panelIsVisble){
                showChoices(); 
            }
            if (visibleCount == 1) {
                navigateAspect.hoverIn(filterManagerAspect.getNavigateManager().getHead())
            } else {
                if (panelIsVisble)
                    hoveredChoiceAspect.resetHoveredChoice();
            }   
        }else{
            if (popupAspect.isChoicesVisible())
                hideChoices();
        }
    }

    filterDom.onInput(() => {
        let {filterInputValue, isEmpty} = inputAspect.processInput();
        if (isEmpty)
            filterManagerAspect.processEmptyInput();
        else
            filterDom.setWidth(filterInputValue);  

        afterInput();
    });

    function keyDownArrow(down) {
        let wrap = navigateAspect.navigate(down);  
        if (wrap)
        {
            navigateAspect.hoverIn(wrap); // !
            showChoices(); // !
        }
    }

    function hoveredToSelected(){
        let hoveredWrap = hoveredChoiceAspect.getHoveredChoice(); 
        if (hoveredWrap){
            let wasToggled = optionToggleAspect.toggle(hoveredWrap); 
            if (wasToggled) {
                resetLayoutAspect.resetLayout();
            }
        }
    }

    // TODO: bind it more declarative way? (compact code)
    var onKeyDown = (event) => {
        let keyCode = event.which;
        var empty = filterDom.isEmpty();
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
                let wrap = picksList.getTail();
                if (wrap){ 
                    wrap.pick?.setSelectedFalse(); 
                    popupAspect.updatePopupLocation();
                }
            }
        }
        // ---------------------------------------------------------------------------------
        // NOTE: no preventDefault called in case of empty for 9-tab
        else if (keyCode == 9  /*tab*/) { // NOTE: no keydown for this (without preventDefaul after TAB keyup event will be targeted another element)  
            if (empty) { 
                hideChoices();  // hideChoices inside (and no filter reset since it is empty) 
            }
        }
        else if (keyCode == 27 /*esc*/ ) { // NOTE: forbid the ESC to close the modal (in case the nonempty or dropdown is open)
        
            if (!empty  || popupAspect.isChoicesVisible())
                event.stopPropagation()
        }
        else if (keyCode == 38) {
            keyDownArrow(false); // up
        }
        else if (keyCode == 40) {
            keyDownArrow(true); // down
        }
    }
    var onKeyUp = (event) => {
        let keyCode = event.which;
        //var handler = keyUp[event.which/* key code */];
        //handler();    
        if (keyCode == 9) {
            if (popupAspect.isChoicesVisible()) {
                hoveredToSelected();
            } 
        }
        else if (keyCode == 13 ) {
            if (popupAspect.isChoicesVisible()) {
                hoveredToSelected();
            } else {
                if (filterManagerAspect.getNavigateManager().getCount()>0){
                    showChoices();
                }
            }
        }
        else if (keyCode == 27) { // escape
            // is it always empty (bs x can still it) 
            resetLayoutAspect.resetLayout();
        }
    }

    filterDom.onKeyDown(onKeyDown);    
    filterDom.onKeyUp(onKeyUp);

    let origSetDisabledComponent = setDisabledComponentAspect.setDisabledComponent; 
    setDisabledComponentAspect.setDisabledComponent = (isComponentDisabled) => {
        origSetDisabledComponent(isComponentDisabled);
        if (isComponentDisabled)
            componentDisabledEventBinder.unbind();
        else
            componentDisabledEventBinder.bind(picksElement, "click",  clickToShowChoices); 
    }

    resetLayoutAspect.resetLayout = composeSync(
        hideChoices,
        resetLayoutAspect.resetLayout // resetFilter by default
    );

    let origCreatePickHandlers = createPickHandlersAspect.createPickHandlers;
    createPickHandlersAspect.createPickHandlers = (wrap) => {
        let pickHandlers = origCreatePickHandlers(wrap);
        pickHandlers.removeOnButton = handleOnRemoveButton(pickHandlers.removeOnButton);
        return pickHandlers;
    } 

    let origBuildChoice = buildChoiceAspect.buildChoice;
    buildChoiceAspect.buildChoice = (wrap) => {
        origBuildChoice(wrap);
        let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
        wrap.choice.remove = composeSync(wrap.choice.remove, ()=>{
            if (pickHandlers.removePick) {
                pickHandlers.removePick();
                pickHandlers.removePick=null;
            }
        })
        
        let unbindChoiceElement = adoptChoiceElement(wrap);
        wrap.choice.dispose = composeSync(unbindChoiceElement, wrap.choice.dispose)
        addPickAspect.addPick(wrap, pickHandlers);
    }

    return {
        dispose(){
            resetMouseCandidateChoice();
            picksElement.removeEventListener("mousedown", skipoutAndResetMousedown);
            componentDisabledEventBinder.unbind();
        }
    }
}
