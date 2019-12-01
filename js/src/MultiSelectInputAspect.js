function MultiSelectInputAspect (
    document, 
    container, 
    selectedPanel, 
    filterInputItem, dropDownMenu, Popper
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

    return {
        dispose(){
            popper.destroy();
        },
        alignToFilterInputItemLocation(force) {
            let offsetLeft = filterInputItem.offsetLeft;
            if (force || filterInputItemOffsetLeft != offsetLeft){ // position changed
                popper.update();
                this.filterInputItemOffsetLeft=offsetLeft;
            }
        }
    }
}

export default MultiSelectInputAspect;