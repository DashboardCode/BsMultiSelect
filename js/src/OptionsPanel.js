function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul

function OptionsPanel(document, container, dropDownItemContent, styling, 
        getVisibleMultiSelectDataList, resetFilter,updateDropDownLocation, filterPanelSetFocus) {
    var dropDownMenu = document.createElement('UL');
    dropDownMenu.style.display="none";

    // prevent heavy understandable styling error
    defDropDownMenuStyleSys(dropDownMenu.style);
    var hoveredMultiSelectData=null;
    var hoveredMultiSelectDataIndex = null;
    var candidateToHoveredMultiSelectData=null;

    var skipFocusout = false;
    var inShowDropDown = false;
    
    // we want to escape the closing of the menu on a user's click inside the container
    var containerMousedown = function(){
        skipFocusout = true;
    };    
                
    // TODO : this.containerMousedown , this.documentMouseup and filterInput.focusOut are actual only when menu is open
    var documentMouseup = function(event) {
        // if click outside container - close dropdown
        if (!(container === event.target || container.contains(event.target))) {
            hideDropDown();
            resetFilter();
        }
    }

    function setInShowDropDown(){
        inShowDropDown = true;
            setTimeout( () => {  
                inShowDropDown = null;
            }, 0)
    }    

    function hideDropDown() {
        if (candidateToHoveredMultiSelectData){
            resetCandidateToHoveredMultiSelectData();
        }
        if (dropDownMenu.style.display != 'none')
        {
            dropDownMenu.style.display = 'none';
            // remove listeners that manages close dropdown on input's focusout and click outside container
            container.removeEventListener("mousedown", containerMousedown);
            document.removeEventListener("mouseup", documentMouseup);
        }
    }

    function showDropDown() {
        if (dropDownMenu.style.display != 'block')
        {
            setInShowDropDown();
            dropDownMenu.style.display = 'block';
            // remove listeners that manages close dropdown on input's focusout and click outside container
            container.addEventListener("mousedown", containerMousedown);
            document.addEventListener("mouseup", documentMouseup);
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

    var  onDropDownMenuItemElementMouseoverGeneral = function(MultiSelectData, dropDownMenuItemElement)
    {
        if (inShowDropDown)
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

    function insertDropDownItem(MultiSelectData, createSelectedItemGen, triggerChange, isSelected, isOptionDisabled) {
        var dropDownMenuItemElement = document.createElement('LI');
        
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
            if (! inShowDropDown)
            {
             
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
                    createSelectedItem();
                    triggerChange();
                }
        }
        // TODO
        // MultiSelectData.removeDropDownMenuItemElement = () => {
        //     removeElement(dropDownMenuItemElement);
        //     if (MultiSelectData.selectedItemElement!=null)
        //         removeElement(MultiSelectData.selectedItemElement);
        // }
    }

    var item = {
        dropDownMenu,
        hoverInInternal,
        resetDropDownMenuHover,
        setInShowDropDown, 
        showDropDown,
        hideDropDown,
        toggleHovered,
        getSkipFocusout : function() {return skipFocusout},
        resetSkipFocusout : function() {skipFocusout=false},
        keyDownArrow,
        insertDropDownItem
        
    }
    return item;
}

export default OptionsPanel;