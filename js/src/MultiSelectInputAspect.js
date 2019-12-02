function MultiSelectInputAspect (
    document, 
    container, 
    selectedPanel, 
    filterInputItem, 
    dropDownMenu, 
    showDropDown,
    getVisibleMultiSelectDataList,
    Popper
    ) {

    container.appendChild(selectedPanel);
    container.appendChild(dropDownMenu);

    var popper = new Popper( 
        filterInputItem, 
        dropDownMenu, 
        {
            placement: 'bottom-start',
            modifiers: {
                preventOverflow: {enabled:false},
                hide: {enabled:false},
                flip: {enabled:false}
            }
        }
    );

    var filterInputItemOffsetLeft = null;
    var preventDefaultClickEvent = null;

    function alignAndShowDropDown(event){
        if (preventDefaultClickEvent != event) {
            if (getVisibleMultiSelectDataList().length > 0)
            {
                alignToFilterInputItemLocation(true);
                showDropDown();
            }
        }
        preventDefaultClickEvent=null;
    }
    
    function alignToFilterInputItemLocation(force) {
        let offsetLeft = filterInputItem.offsetLeft;
        if (force || filterInputItemOffsetLeft != offsetLeft){ // position changed
            popper.update();
            filterInputItemOffsetLeft = offsetLeft;
        }
    }

    return {
        dispose(){
            popper.destroy();
        },
        alignToFilterInputItemLocation,
        alignAndShowDropDown,
        setPreventDefaultMultiSelectEvent(event){
            preventDefaultClickEvent = event;
        }
    }
}

export default MultiSelectInputAspect;