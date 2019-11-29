function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul

function OptionsPanel(document, container, init, styling, 
        getVisibleMultiSelectDataList, resetFilter,updateDropDownLocation) {
    var dropDownMenu = document.createElement('UL');
    dropDownMenu.style.display="none";
    init(dropDownMenu);

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


    var setInShowDropDown= function(){
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

    function hoverInInternal(index){
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

    function resetCandidateToHoveredMultiSelectData(){
        candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousemove', processCandidateToHovered);
        candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousedown', processCandidateToHovered);
        candidateToHoveredMultiSelectData = null;
    }

    function processCandidateToHovered() {
        if (hoveredMultiSelectData!=candidateToHoveredMultiSelectData)
        {
            resetDropDownMenuHover(); 
            hoverInInternal(candidateToHoveredMultiSelectData.visibleIndex);
        }
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

    var item = {
        dropDownMenu,
        
        processCandidateToHovered,
        hoverInInternal,
        resetDropDownMenuHover,
        setInShowDropDown, 
        showDropDown,
        hideDropDown,
        toggleHovered,
        getSkipFocusout : function() {return skipFocusout},
        resetSkipFocusout : function() {skipFocusout=false},
        keyDownArrow,
        onDropDownMenuItemElementMouseover : function(MultiSelectData, dropDownMenuItemElement)
        {
            if (!inShowDropDown)
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
            else
            {
                candidateToHoveredMultiSelectData = MultiSelectData;
                dropDownMenuItemElement.addEventListener('mousemove', processCandidateToHovered);
                dropDownMenuItemElement.addEventListener('mousedown', processCandidateToHovered);
            }
        }
    }
    return item;
}

export default OptionsPanel;
