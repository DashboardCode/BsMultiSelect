function SelectItem( 
    setSelected, MultiSelectData, dropDownItemContentSelect, dropDownItemContentDisable, 
    document, triggerChange, 
    ) {

    return {
        Init(doPublishEvents){
            var selectedItemElement = document.createElement('LI');
            MultiSelectData.selectedItemElement = selectedItemElement;

            changeTail(MultiSelectData);
            
            let adjustPair = (isSelected, toggle, remove, disable) => {
                //MultiSelectData.option.selected=isSelected;
                setSelected(option, isSelected);
                MultiSelectData.excludedFromSearch = isSelected || isOptionDisabled;
                dropDownItemContentSelect(isSelected);
                MultiSelectData.toggle=toggle;
                MultiSelectData.remove=remove;
                MultiSelectData.disable=disable;
            }

            let removeSelectedItem = () => {
                dropDownItemContentDisable();
                // dropDownItemContent.disabledStyle(false);
                // dropDownItemContent.disable(isOptionDisabled);
                adjustPair(
                    false, 
                    () => {
                        if (isOptionDisabled)
                            return;
                        selectItem(true);
                    }, 
                    null,
                    null
                    );
                removeElement(selectedItemElement);
                removeSelectedFromList(MultiSelectData);
                triggerChange();
            };
            
            // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
            // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
            // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
            // because of the event's bubling process removeSelectedItem runs first. 
            // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
            // before we could analize is it belong to our dropdown or not.
            // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
            // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
            // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
            // the situation described above: click outside dropdown on the same component.
            // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target that belomgs to DOM (e.g. panel)

            let removeSelectedItemAndCloseDropDown = () => {
                removeSelectedItem();
                closeDropDown();
            };

            let onRemoveSelectedItemEvent = () => {
                setTimeout( ()=> {  
                    removeSelectedItemAndCloseDropDown();
                }, 0);
            };

            let preventDefaultMultiSelect = (event) => {
                setPreventDefaultMultiSelectEvent(event);
            }

            let bsSelectedItemContent = createSelectedItemContent(
                selectedItemElement,
                MultiSelectData.option,
                onRemoveSelectedItemEvent,
                preventDefaultMultiSelect
            );

            bsSelectedItemContent.disable(isComponentDisabled);
            adjustPair(true, ()=>removeSelectedItem(), removeSelectedItemAndCloseDropDown, bsSelectedItemContent.disable);

            insertBefore(selectedItemElement);
            if (doPublishEvents){
                triggerChange();
            }
        },
        
    }
    
}

export default SelectItem;