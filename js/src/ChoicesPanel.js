export function ChoicesPanel(
        createChoiceElement, choicesElement, 
        onShow, 
        onHide, 
        eventSkipper, choiceContentGenerator, 
        getVisibleMultiSelectDataList, 
        resetFilter, updateChoicesLocation, filterPanelSetFocus) {
    
    var hoveredMultiSelectData=null;
    var hoveredMultiSelectDataIndex = null;
    var candidateToHoveredMultiSelectData=null;

    function hideChoices() {
        if (candidateToHoveredMultiSelectData){
            candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData();
        }
        if (choicesElement.style.display != 'none')
        {
            choicesElement.style.display = 'none';
            onHide();
        }
    }

    function showChoices() {
        if (choicesElement.style.display != 'block')
        {
            eventSkipper.setSkippable();
            choicesElement.style.display = 'block';
            onShow();
        }
    }

    var hoverInInternal = function(index){
        hoveredMultiSelectDataIndex = index;
        
        hoveredMultiSelectData = getVisibleMultiSelectDataList()[index];
        
        hoveredMultiSelectData.ChoiceContent.hoverIn(true)
    }

    function resetChoicesHover() {
        if (hoveredMultiSelectData) {
            hoveredMultiSelectData.ChoiceContent.hoverIn(false)
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
        if(candidateToHoveredMultiSelectData) 
            candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData();
    }

    function toggleHovered(){
        if (hoveredMultiSelectData) {
            if (hoveredMultiSelectData.toggle)
                hoveredMultiSelectData.toggle();
            resetChoicesHover();
            hideChoices(); // always hide 1st
            resetFilter();
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
                hoveredMultiSelectData.ChoiceContent.hoverIn(false)
            updateChoicesLocation();
            showChoices(); 
            hoverInInternal(newIndex);
        }
    }

    var onChoiceElementMouseoverGeneral = function(MultiSelectData, choiceElement)
    {
        if (eventSkipper.isSkippable())
        {
            if(candidateToHoveredMultiSelectData)
                candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData()

            candidateToHoveredMultiSelectData = MultiSelectData;
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
            if (hoveredMultiSelectData!=MultiSelectData)
            {
                // mouseleave is not enough to guarantee remove hover styles in situations
                // when style was setuped without mouse (keyboard arrows)
                // therefore force reset manually
                resetChoicesHover(); 
                hoverInInternal(MultiSelectData.visibleIndex);
            }                
        }
    }

    function createChoice(MultiSelectData, createSelectedItemGen, setSelected, triggerChange, isSelected/*, isOptionDisabled*/) 
    {
        var choiceElement = createChoiceElement();
        
        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onChoiceElementMouseover = () => onChoiceElementMouseoverGeneral(
            MultiSelectData,
            choiceElement
        )

        choiceElement.addEventListener('mouseover', onChoiceElementMouseover);
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onChoiceElementMouseleave = () => {
            if (!eventSkipper.isSkippable()) {
                resetChoicesHover();
            }
        }

        choiceElement.addEventListener('mouseleave', onChoiceElementMouseleave);

        choicesElement.appendChild(choiceElement);

        let choiceContent = choiceContentGenerator(choiceElement); 
        choiceContent.setData(MultiSelectData.option);

        MultiSelectData.ChoiceContent = choiceContent;

        MultiSelectData.select = (isSelected)=> {
            choiceContent.select(isSelected);
        }

        MultiSelectData.disable = (isDisabled, isSelected)=> {
            choiceContent.disable( isDisabled, isSelected); 
        }

        MultiSelectData.disposeChoice = ()=> {
            choiceElement.removeEventListener('mouseover',  onChoiceElementMouseover);
            choiceElement.removeEventListener('mouseleave', onChoiceElementMouseleave);
            choiceContent.dispose();
            MultiSelectData.select=null;
            MultiSelectData.disable=null;
            MultiSelectData.disposeChoice=null;
        }

        if (MultiSelectData.isOptionDisabled)
            choiceContent.disable(true, isSelected )

        choiceContent.onSelected( () => {
            if (MultiSelectData.toggle)
                MultiSelectData.toggle();
            filterPanelSetFocus();
        });
        // ------------------------------------------------------------------------------
        
        var createSelectedItem = () => createSelectedItemGen(MultiSelectData);
        
        if (isSelected)
        {
            createSelectedItem();
        }
        else
        {
            MultiSelectData.excludedFromSearch =  MultiSelectData.isOptionDisabled;
            if (MultiSelectData.isOptionDisabled)
                MultiSelectData.toggle = null;
            else
                MultiSelectData.toggle = () =>  {
                    var confirmed = setSelected(MultiSelectData.option, true);
                    if (!(confirmed===false)) {
                        createSelectedItem();
                        triggerChange();
                    }
                }
        }
        return {
            visible(isFiltered){
                choiceElement.style.display = isFiltered ? 'block': 'none';
            }
        }
    }

    var item = {
        hoverInInternal,
        stopAndResetChoicesHover(){
            eventSkipper.setSkippable(); //disable Hover On MouseEnter - filter's changes should remove hover
            resetChoicesHover();
        },
        showChoices,
        hideChoices,
        toggleHovered,
        keyDownArrow,
        createChoice,
        getIsVisble(){
            return choicesElement.style.display != 'none';
        },
        clear() {
            choicesElement.innerHTML = ""; 
        },
    }
    return item;
}