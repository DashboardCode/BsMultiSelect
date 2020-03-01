import {EventBinder} from './ToolsDom'

export function ChoicesPanel(
        createChoiceElement,
        toggle, 
        getEventSkipper, 
        choiceContentGenerator, 
        getVisibleMultiSelectDataList, 
        onToggleHovered, 
        onMoveArrow, 
        filterPanelSetFocus) {
    
    var hoveredChoice=null;
    var hoveredChoiceIndex = null;
    var candidateToHoveredChoice=null;

    function resetCandidateToHoveredChoice(){
        if (candidateToHoveredChoice){
            candidateToHoveredChoice.resetCandidateToHoveredChoice();
        }
    }

    var hoverInInternal = function(index){
        hoveredChoiceIndex = index;
        
        hoveredChoice = getVisibleMultiSelectDataList()[index];
        hoveredChoice.isHoverIn = true;
        hoveredChoice.updateHoverIn()
    }

    function resetChoicesHover() {
        if (hoveredChoice) {
            hoveredChoice.isHoverIn = false;
            hoveredChoice.updateHoverIn()
            hoveredChoice = null;
            hoveredChoiceIndex = null;
        }
    }

    var processCandidateToHovered = function() {
        if (hoveredChoice != candidateToHoveredChoice)
        {
            resetChoicesHover(); 
            hoverInInternal(candidateToHoveredChoice.visibleIndex);
        }
        resetCandidateToHoveredChoice();
    }

    function toggleHovered() {
        let choice = hoveredChoice;
        if (choice) {
            if (toggle(choice)){
                resetChoicesHover();
                onToggleHovered();
            }
        } 
    }

    function keyDownArrow(down) {
        let visibleMultiSelectDataList = getVisibleMultiSelectDataList();
        let length = visibleMultiSelectDataList.length;
        let newIndex=null;
        if (length > 0) {
            if (down) {
                let i = hoveredChoiceIndex===null?0:hoveredChoiceIndex+1;
                while(i<length){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i++;
                }
            } else {
                let i = hoveredChoiceIndex===null?length-1:hoveredChoiceIndex-1;
                while(i>=0){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i--;
                }
            }
        }
        
        if (newIndex!==null)
        {
            if (hoveredChoice){
                hoveredChoice.isHoverIn = false;
                hoveredChoice.updateHoverIn()
            }
            onMoveArrow();
            //showChoices(); 
            hoverInInternal(newIndex);
        }
    }

    var onChoiceElementMouseoverGeneral = function(choice, choiceElement)
    {
        let eventSkipper = getEventSkipper();
        if (eventSkipper.isSkippable())
        {
            resetCandidateToHoveredChoice();

            candidateToHoveredChoice = choice;
            var eventBinder = EventBinder();
            eventBinder.bind(choiceElement, 'mousemove', processCandidateToHovered);
            eventBinder.bind(choiceElement, 'mousedown', processCandidateToHovered);

            candidateToHoveredChoice.resetCandidateToHoveredChoice = ()=>{
                eventBinder.unbind();
                candidateToHoveredChoice.resetCandidateToHoveredChoice=null;
                candidateToHoveredChoice = null;
            }
        }
        else
        {
            if (/*hoveredChoice!=choice*/!choice.isHoverIn)
            {
                // mouseleave is not enough to guarantee remove hover styles in situations
                // when style was setuped without mouse (keyboard arrows)
                // therefore force reset manually
                resetChoicesHover(); 
                hoverInInternal(choice.visibleIndex);
            }                
        }
    }

    function adoptChoice(choice) 
    {
        var {choiceElement, attach} = createChoiceElement();
        
        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onChoiceElementMouseover = () => onChoiceElementMouseoverGeneral(
            choice,
            choiceElement
        )

        //choiceElement.addEventListener('mouseover', onChoiceElementMouseover);
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onChoiceElementMouseleave = () => {
            let eventSkipper = getEventSkipper();
            if (!eventSkipper.isSkippable()) {
                resetChoicesHover();
            }
        }
        //choiceElement.addEventListener('mouseleave', onChoiceElementMouseleave);
        var eventBinder = EventBinder();
        eventBinder.bind(choiceElement, 'mouseover', onChoiceElementMouseover);
        eventBinder.bind(choiceElement, 'mouseleave', onChoiceElementMouseleave);
        

        let choiceContent = choiceContentGenerator(choiceElement); 
        attach();

        choiceContent.setData(choice.option);

        choice.updateHoverIn = () => {
            choiceContent.hoverIn(choice.isHoverIn);
        }

        choice.select = () => {
            choiceContent.select(choice.isOptionSelected);
        }

        choice.disable = (isDisabled, isOptionSelected) => {
            choiceContent.disable( isDisabled, isOptionSelected); 
        }

        choice.dispose = ()=> {
            eventBinder.unbind();
            //choiceElement.removeEventListener('mouseover',  onChoiceElementMouseover);
            //choiceElement.removeEventListener('mouseleave', onChoiceElementMouseleave);
            choiceContent.dispose();

            choice.setVisible = null;
            choice.updateHoverIn = null;
            choice.select = null;
            choice.disable = null;
            choice.dispose = null;

            choice.updateSelectedFalse = null;
            choice.updateSelectedTrue = null;
        }

        if (choice.isOptionDisabled)
            choiceContent.disable(true, choice.isOptionSelected )

        // TODO movo into choiceContent to handlers switch
        choiceContent.onSelected( () => {
            toggle(choice)
            filterPanelSetFocus();
        });
        choice.setVisible = (isFiltered)=>{
            choiceElement.style.display = isFiltered ? 'block': 'none';
        }
        
    }

    var item = {
        adoptChoice,
        setFirstChoiceHovered: ()=>hoverInInternal(0),
        stopAndResetChoicesHover(){
            let eventSkipper = getEventSkipper();
            eventSkipper.setSkippable(); //disable Hover On MouseEnter - filter's changes should remove hover
            resetChoicesHover();
        },
        resetCandidateToHoveredChoice: resetCandidateToHoveredChoice,
        toggleHovered,
        keyDownArrow
    }
    return item;
}

