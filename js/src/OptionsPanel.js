function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul

function OptionsPanel(createElement, dropDownMenu, onShow, onHide, eventSkipper, dropDownItemContent, styling, 
        getVisibleMultiSelectDataList, resetFilter, updateDropDownLocation, filterPanelSetFocus) {
    
    // prevent heavy understandable styling error
    defDropDownMenuStyleSys(dropDownMenu.style);
    var hoveredMultiSelectData=null;
    var hoveredMultiSelectDataIndex = null;
    var candidateToHoveredMultiSelectData=null;

    function hideDropDown() {
        if (candidateToHoveredMultiSelectData){
            resetCandidateToHoveredMultiSelectData();
        }
        if (dropDownMenu.style.display != 'none')
        {
            dropDownMenu.style.display = 'none';
            onHide();
        }
    }

    function showDropDown() {
        if (dropDownMenu.style.display != 'block')
        {
            eventSkipper.setSkippable();
            dropDownMenu.style.display = 'block';
            onShow();
        }
    }

    var hoverInInternal = function(index){
        hoveredMultiSelectDataIndex = index;
        hoveredMultiSelectData = getVisibleMultiSelectDataList()[index];
        styling.HoverIn(hoveredMultiSelectData.dropDownMenuItemElement);
    }

    function resetDropDownMenuHover() {
        if (hoveredMultiSelectData) {
            styling.HoverOut(hoveredMultiSelectData.dropDownMenuItemElement);
            hoveredMultiSelectData = null;
            hoveredMultiSelectDataIndex = null;
        }
    }

    var resetCandidateToHoveredMultiSelectData = function(){
        candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousemove', processCandidateToHovered);
        candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousedown', processCandidateToHovered);
        candidateToHoveredMultiSelectData = null;
    }

    var processCandidateToHovered = function() {
        if (hoveredMultiSelectData != candidateToHoveredMultiSelectData)
        {
            resetDropDownMenuHover(); 
            hoverInInternal(candidateToHoveredMultiSelectData.visibleIndex);
        }
        if(candidateToHoveredMultiSelectData) 
            resetCandidateToHoveredMultiSelectData();
    }

    function toggleHovered(){
        if (hoveredMultiSelectData) {
            hoveredMultiSelectData.toggle();
            resetDropDownMenuHover();
            hideDropDown(); // always hide 1st
            resetFilter();
        } 
    }

    function keyDownArrow(down) {
        let visibleMultiSelectDataList = getVisibleMultiSelectDataList();
        let length = visibleMultiSelectDataList.length;
        let newIndex=null;
        if (length > 0) {
            if (down) {
                let i = hoveredMultiSelectDataIndex==null?0:hoveredMultiSelectDataIndex+1;
                while(i<length){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i++;
                }
            } else {
                let i = hoveredMultiSelectDataIndex==null?length-1:hoveredMultiSelectDataIndex-1;
                while(i>=0){
                    if (visibleMultiSelectDataList[i].visible){
                        newIndex=i;
                        break;
                    }
                    i--;
                }
            }
        }
        
        if (newIndex!=null)
        {
            if (hoveredMultiSelectData)
                styling.HoverOut(hoveredMultiSelectData.dropDownMenuItemElement);
            updateDropDownLocation();
            showDropDown(); 
            hoverInInternal(newIndex);
        }
    }

    var onDropDownMenuItemElementMouseoverGeneral = function(MultiSelectData, dropDownMenuItemElement)
    {
        if (eventSkipper.isSkippable())
        {
            if(candidateToHoveredMultiSelectData)
                resetCandidateToHoveredMultiSelectData()

            candidateToHoveredMultiSelectData = MultiSelectData;
            dropDownMenuItemElement.addEventListener('mousemove', processCandidateToHovered);
            dropDownMenuItemElement.addEventListener('mousedown', processCandidateToHovered);
        }
        else
        {
            if (hoveredMultiSelectData!=MultiSelectData)
            {
                // mouseleave is not enough to guarantee remove hover styles in situations
                // when style was setuped without mouse (keyboard arrows)
                // therefore force reset manually
                resetDropDownMenuHover(); 
                hoverInInternal(MultiSelectData.visibleIndex);
            }                
        }
    }

    function insertDropDownItem(MultiSelectData, createSelectedItemGen, setSelected, triggerChange, isSelected, isOptionDisabled) {
        var dropDownMenuItemElement = createElement('LI');
        
        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onDropDownMenuItemElementMouseover = () => onDropDownMenuItemElementMouseoverGeneral(
            MultiSelectData,
            dropDownMenuItemElement
        )

        dropDownMenuItemElement.addEventListener('mouseover', onDropDownMenuItemElementMouseover);
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onDropDownMenuItemElementMouseleave = () => {
            if (!eventSkipper.isSkippable()) {
                resetDropDownMenuHover();
            }
        }

        dropDownMenuItemElement.addEventListener('mouseleave', onDropDownMenuItemElementMouseleave);

        dropDownMenu.appendChild(dropDownMenuItemElement);

        let content = dropDownItemContent(dropDownMenuItemElement, MultiSelectData.option); 
        MultiSelectData.dropDownMenuItemElement = dropDownMenuItemElement;
        MultiSelectData.DropDownItemContent = content;

        MultiSelectData.DisposeDropDownMenuItemElement = ()=> {
            dropDownMenuItemElement.removeEventListener('mouseover',  onDropDownMenuItemElementMouseover);
            dropDownMenuItemElement.removeEventListener('mouseleave', onDropDownMenuItemElementMouseleave);
        }

        var setDropDownItemContentDisabled = (content,  isSelected) => {
            content.disabledStyle(true);
            // do not desable if selected! there should be possibility to unselect "disabled"
            content.disable(!isSelected);
        }

        if (isOptionDisabled)
            setDropDownItemContentDisabled(content, isSelected )

        content.onSelected( () => {
            MultiSelectData.toggle();
            filterPanelSetFocus();
        });
        // ------------------------------------------------------------------------------
        
        var createSelectedItem = () => createSelectedItemGen(
            MultiSelectData,
            isOptionDisabled,
            () => setDropDownItemContentDisabled(content, false)
        );
        
        if (isSelected)
        {
            createSelectedItem();
        }
        else
        {
            MultiSelectData.excludedFromSearch =  isOptionDisabled;
            if (isOptionDisabled)
                MultiSelectData.toggle = () => { }
            else
                MultiSelectData.toggle = () =>  {
                    var confirmed = setSelected(MultiSelectData.option, true);
                    if (confirmed==null || confirmed) {
                        createSelectedItem();
                        triggerChange();
                    }
                }
        }
        // TODO: refactore it
    }

    var item = {
        hoverInInternal,
        stopAndResetDropDownMenuHover(){
            eventSkipper.setSkippable(); //disable Hover On MouseEnter - filter's changes should remove hover
            resetDropDownMenuHover();
        },
        showDropDown,
        hideDropDown,
        toggleHovered,
        keyDownArrow,
        insertDropDownItem,
        getIsVisble(){
            return dropDownMenu.style.display != 'none';
        }
        
    }
    return item;
}

export default OptionsPanel;