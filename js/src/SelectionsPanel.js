import Popper from 'popper.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul
function defFilterInputStyleSys(s) {s.width='2ch'; s.border='0'; s.padding='0'; s.outline='none'; s.backgroundColor='transparent' };
function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul
function removeElement(e) {e.parentNode.removeChild(e)}

class SelectionsPanel {
    constructor(optionsAdapter, styling, 
        selectedItemContent, dropDownItemContent, 
        labelAdapter, createStylingComposite,
        configuration, onDispose,  isDisabled, document) {
        // state
        MultiSelectDataSelectedTail=null;
        return { 
            selectItem(MultiSelectData, doPublishEvents){
                var selectedItemElement = document.createElement('LI');
                MultiSelectData.selectedItemElement = selectedItemElement;

                if (this.MultiSelectDataSelectedTail){
                    this.MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
                    MultiSelectData.selectedPrev=this.MultiSelectDataSelectedTail;
                }
                this.MultiSelectDataSelectedTail=MultiSelectData; 

                let adjustPair =(isSelected, toggle, remove, disable) => {
                    MultiSelectData.excludedFromSearch = isSelected || isDisabled;
                    MultiSelectData.option.selected=isSelected;

                    dropDownItemContent.select(isSelected);
                    MultiSelectData.toggle=toggle;
                    MultiSelectData.remove=remove;
                    MultiSelectData.disable=disable;
                }

            let removeSelectedItem = () => {
                dropDownItemContent.disabledStyle(false);
                dropDownItemContent.disable(isDisabled);
                adjustPair(
                    false, 
                    () => {
                        if (isDisabled)
                            return;
                        selectItem(true);
                    }, 
                    null,
                    null
                    );
                removeElement(selectedItemElement);
                
                this.removeSelectedFromList(MultiSelectData);

                this.optionsAdapter.triggerChange();
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
                this.closeDropDown();
            };

            let onRemoveSelectedItemEvent = () => {
                setTimeout( ()=> {  
                    removeSelectedItem();
                    this.closeDropDown();
                }, 0);
            };

            let preventDefaultMultiSelect = (event) => {
                this.preventDefaultMultiSelectEvent=event;
            }

            let bsSelectedItemContent = this.selectedItemContent(
                selectedItemElement,
                MultiSelectData.option,
                onRemoveSelectedItemEvent,
                preventDefaultMultiSelect
            );

            bsSelectedItemContent.disable(this.disabled);
            adjustPair(true, ()=>removeSelectedItem(), removeSelectedItemAndCloseDropDown, bsSelectedItemContent.disable);

            this.selectedPanel.insertBefore(selectedItemElement, this.filterInputItem);
            if (doPublishEvents){
                this.optionsAdapter.triggerChange();
            }
        }
        }
    }
 
    appendDropDownItem(MultiSelectData, isSelected, isDisabled) {
        var dropDownMenuItemElement=this.document.createElement('LI');
        this.dropDownMenu.appendChild(dropDownMenuItemElement); 
        let dropDownItemContent = this.dropDownItemContent(dropDownMenuItemElement, MultiSelectData.option); 
        MultiSelectData.dropDownMenuItemElement= dropDownMenuItemElement;
        MultiSelectData.dropDownItemContent= dropDownItemContent;

        if (isSelected && isDisabled)
            dropDownItemContent.disabledStyle(true);
        else if (isDisabled)
            dropDownItemContent.disable(isDisabled);

        dropDownItemContent.onSelected(() => {
            MultiSelectData.toggle();
            this.filterInput.focus();
        });
        
        

        dropDownMenuItemElement.addEventListener('mouseover', () => 
             this.styling.HoverIn(dropDownMenuItemElement));
        dropDownMenuItemElement.addEventListener('mouseout', () =>             
             this.styling.HoverOut(dropDownMenuItemElement));
        
        if (isSelected)
            selectItem(false);
        else
            MultiSelectData.toggle = () => { 
                if (isDisabled)
                    return;
                selectItem(true);
            }

        MultiSelectData.removeDropDownMenuItemElement = () => {
            removeElement(dropDownMenuItemElement);
            if (MultiSelectData.selectedItemElement!=null)
                removeElement(MultiSelectData.selectedItemElement);
        }
    }

  
}

export default SelectionsPanel;
