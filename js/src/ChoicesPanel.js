export function ChoicesPanel(
        createChoiceElement, 
        getEventSkipper, 
        choiceContentGenerator, 
        getVisibleMultiSelectDataList, 
        onToggleHovered, 
        onMoveArrow, 
        filterPanelSetFocus) {
    
    var hoveredMultiSelectData=null;
    var hoveredMultiSelectDataIndex = null;
    var candidateToHoveredMultiSelectData=null;

    function resetCandidateToHoveredMultiSelectData(){
        if (candidateToHoveredMultiSelectData){
            candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData();
        }
    }

    var hoverInInternal = function(index){
        hoveredMultiSelectDataIndex = index;
        
        hoveredMultiSelectData = getVisibleMultiSelectDataList()[index];
        
        hoveredMultiSelectData.hoverIn(true)
    }

    function resetChoicesHover() {
        if (hoveredMultiSelectData) {
            hoveredMultiSelectData.hoverIn(false)
            hoveredMultiSelectData = null;
            hoveredMultiSelectDataIndex = null;
        }
    }

    var processCandidateToHovered = function() {
        if (hoveredMultiSelectData != candidateToHoveredMultiSelectData)
        {
            resetChoicesHover(); 
            hoverInInternal(candidateToHoveredMultiSelectData.visibleIndex);
        }
        resetCandidateToHoveredMultiSelectData();
    }

    function toggleHovered() {
        if (hoveredMultiSelectData) {
            if (hoveredMultiSelectData.toggle)
                hoveredMultiSelectData.toggle();
            resetChoicesHover();
            //hideChoices(); // always hide 1st
            onToggleHovered();
        } 
    }

    function keyDownArrow(down) {
        let visibleMultiSelectDataList = getVisibleMultiSelectDataList();
        let length = visibleMultiSelectDataList.length;
        let newIndex=null;
        if (length > 0) {
            if (down) {
                let i = hoveredMultiSelectDataIndex===null?0:hoveredMultiSelectDataIndex+1;
                while(i<length){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i++;
                }
            } else {
                let i = hoveredMultiSelectDataIndex===null?length-1:hoveredMultiSelectDataIndex-1;
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
            if (hoveredMultiSelectData)
                hoveredMultiSelectData.hoverIn(false)
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
            resetCandidateToHoveredMultiSelectData();

            candidateToHoveredMultiSelectData = choice;
            choiceElement.addEventListener('mousemove', processCandidateToHovered);
            choiceElement.addEventListener('mousedown', processCandidateToHovered);

            candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData = ()=>{
                choiceElement.removeEventListener('mousemove', processCandidateToHovered);
                choiceElement.removeEventListener('mousedown', processCandidateToHovered);
                candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData=null;
                candidateToHoveredMultiSelectData = null;
            }
        }
        else
        {
            if (hoveredMultiSelectData!=choice)
            {
                // mouseleave is not enough to guarantee remove hover styles in situations
                // when style was setuped without mouse (keyboard arrows)
                // therefore force reset manually
                resetChoicesHover(); 
                hoverInInternal(choice.visibleIndex);
            }                
        }
    }

    function adoptChoice(choice, createPick, setSelected, triggerChange, isOptionSelected/*, isOptionDisabled*/) 
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

        choiceElement.addEventListener('mouseover', onChoiceElementMouseover);
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onChoiceElementMouseleave = () => {
            let eventSkipper = getEventSkipper();
            if (!eventSkipper.isSkippable()) {
                resetChoicesHover();
            }
        }

        choiceElement.addEventListener('mouseleave', onChoiceElementMouseleave);

        attach();

        let choiceContent = choiceContentGenerator(choiceElement); 
        choiceContent.setData(choice.option);

        choice.hoverIn = (isHoverIn) => {
            choiceContent.hoverIn(isHoverIn);
        }

        choice.select = (isOptionSelected) => {
            choiceContent.select(isOptionSelected);
        }

        choice.disable = (isDisabled, isOptionSelected) => {
            choiceContent.disable( isDisabled, isOptionSelected); 
        }

        choice.dispose = ()=> {
            choiceElement.removeEventListener('mouseover',  onChoiceElementMouseover);
            choiceElement.removeEventListener('mouseleave', onChoiceElementMouseleave);
            choiceContent.dispose();

            choice.hoverIn = null;
            choice.select = null;
            choice.disable = null;
            choice.dispose = null;
            choice.toggle = null;
            choice.setVisible = null;
        }

        if (choice.isOptionDisabled)
            choiceContent.disable(true, isOptionSelected )

        choiceContent.onSelected( () => {
            if (choice.toggle)
                choice.toggle();
            filterPanelSetFocus();
        });

        if (isOptionSelected)
        {
            createPick();
        }
        else
        {
            choice.excludedFromSearch =  choice.isOptionDisabled;
            if (choice.isOptionDisabled)
                choice.toggle = null;
            else
                choice.toggle = () =>  {
                    var confirmed = setSelected(choice.option, true);
                    if (!(confirmed===false)) {
                        createPick();
                        triggerChange();
                    }
                }
        }
        choice.setVisible = (isFiltered)=>{
            choiceElement.style.display = isFiltered ? 'block': 'none';
        }
            
    }

    /* Picks:
            addPick,
            removePicksTail,
            isEmpty,
            getCount,
            disable,
            deselectAll,
            clear,
            dispose
    */
    var item = {
        adoptChoice,
        hoverInInternal,
        stopAndResetChoicesHover(){
            let eventSkipper = getEventSkipper();
            eventSkipper.setSkippable(); //disable Hover On MouseEnter - filter's changes should remove hover
            resetChoicesHover();
        },
        resetCandidateToHoveredMultiSelectData,
        toggleHovered,
        keyDownArrow
    }
    return item;
}