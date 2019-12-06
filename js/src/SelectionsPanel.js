import removeElement from './removeElement.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul

function SelectionsPanel (
    createElement, 
    init, 
    selectedItemContent, 
    isComponentDisabled, 
    triggerChange, 
    onRemove,
    onClick,
    processRemoveButtonClick
    ) 
    {
    var ulElement = createElement('UL');
    defSelectedPanelStyleSys(ulElement.style); 
    var filterInputItem = createElement('LI'); // detached
    ulElement.appendChild(filterInputItem); // located filter in selectionsPanel

    init(filterInputItem);
    var MultiSelectDataSelectedTail = null;

    function removeSelectedTail(){
        if (MultiSelectDataSelectedTail){ 
            MultiSelectDataSelectedTail.toggle(); // always remove in this case
        }
    }

    function removeSelectedFromList(MultiSelectData){
        if (MultiSelectData.selectedPrev){
            (MultiSelectData.selectedPrev).selectedNext = MultiSelectData.selectedNext;
        }
        if (MultiSelectData.selectedNext){
           (MultiSelectData.selectedNext).selectedPrev = MultiSelectData.selectedPrev;
        }
        if (MultiSelectDataSelectedTail == MultiSelectData){
            MultiSelectDataSelectedTail = MultiSelectData.selectedPrev;
        }
        MultiSelectData.selectedNext=null;
        MultiSelectData.selectedPrev=null;
    }


    function createSelectedItem(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled) {
        var selectedItemElement = createElement('LI');
        MultiSelectData.selectedItemElement = selectedItemElement;
        if (MultiSelectDataSelectedTail){
            MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
            MultiSelectData.selectedPrev = MultiSelectDataSelectedTail;
        }
        MultiSelectDataSelectedTail = MultiSelectData;

        var removeSelectedItem = () => {
            MultiSelectData.option.selected = false;
            MultiSelectData.excludedFromSearch = isOptionDisabled;
            if (isOptionDisabled)
            {
                setDropDownItemContentDisabled(MultiSelectData.DropDownItemContent, false);
                MultiSelectData.toggle = ()=> {};
            }
            else
            {
                MultiSelectData.toggle = ()=>{
                    createSelectedItem(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled);
                    triggerChange();
                };
            }
            MultiSelectData.DropDownItemContent.select(false);
            removeElement(selectedItemElement);
            MultiSelectData.SelectedItemContent.dispose();
            MultiSelectData.SelectedItemContent=null;
            MultiSelectData.selectedItemElement=null;

            removeSelectedFromList(MultiSelectData);
            triggerChange();
        }

        // processRemoveButtonClick removes the 
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
            onRemove();
        };
    
        let onRemoveSelectedItemEvent = (event) => {
            processRemoveButtonClick(() => removeSelectedItemAndCloseDropDown(), event);
        };

        MultiSelectData.SelectedItemContent = selectedItemContent(
            selectedItemElement,
            MultiSelectData.option,
            onRemoveSelectedItemEvent);

        var disable = (isDisabled) =>
            MultiSelectData.SelectedItemContent.disable(isDisabled);
        disable(isComponentDisabled);

        MultiSelectData.option.selected = true;
        MultiSelectData.excludedFromSearch = true; // all selected excluded from search
        //MultiSelectData.remove  = removeSelectedItemAndCloseDropDown;
        MultiSelectData.disable = disable;
        ulElement.insertBefore(selectedItemElement, filterInputItem);


        MultiSelectData.toggle = () => removeSelectedItem();
        MultiSelectData.DropDownItemContent.select(true);
        
    }

    var selectedPanelClick = event => {
        onClick(event);
    };

    function iterateAll(isDisabled){
        let i = MultiSelectDataSelectedTail;
        while(i){
            i.disable(isDisabled); 
            i = i.selectedPrev;
        }
    }

    var item = {
        selectedPanel: ulElement,
        filterInputItem,
        insert(selectedItemElement){
            this.selectedPanel.insertBefore(selectedItemElement, filterInputItem);
        },
        createSelectedItem,
        removeSelectedTail,
        resetMultiSelectDataSelectedTail() {
            MultiSelectDataSelectedTail = null;
        },
        enable(){
            filterInputItem.style.display = "list-item";
            iterateAll(false);
            ulElement.addEventListener("click", selectedPanelClick);

        },
        disable(){
            filterInputItem.style.display = "none";
            iterateAll(true);
            ulElement.removeEventListener("click", selectedPanelClick);

        },
        dispose(){
            ulElement.removeEventListener("click", selectedPanelClick); // OPEN dropdown
        }
    }
    return item;
}

export default SelectionsPanel;