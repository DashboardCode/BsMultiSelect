import {removeElement, setStyles} from './DomTools'

const picksStyle = {display:'flex', flexWrap:'wrap', listStyleType:'none'};  // remove bullets since this is ul

export function PicksPanel (
        setSelected,
        createElement,
        picksElement, 
        init, 
        pickContentGenerator, 
        isComponentDisabled, 
        triggerChange, 
        onRemove,
        onClick,
        onPicksEmptyChanged, //placeholderAspect.updatePlacehodlerVisibility(); call the same on enable/disable
        processRemoveButtonClick
) 
{
    var picksCount = 0;
    function inc(){picksCount++; if (picksCount==1) onPicksEmptyChanged()};
    function dec(){picksCount--; if (picksCount==0) onPicksEmptyChanged()};
    function reset(){picksCount=0; onPicksEmptyChanged()}
    function isEmpty(){return picksCount==0};

    setStyles(picksElement, picksStyle); 

    var pickFilterElement = createElement('LI'); // detached
        
    picksElement.appendChild(pickFilterElement); // located filter in selectionsPanel

    init(pickFilterElement);
    var MultiSelectDataSelectedTail = null;

    function removePicksTail(){
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


    function createPick(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled) {
        
        var pickElement = createElement('LI');
        MultiSelectData.pickElement = pickElement;
        if (MultiSelectDataSelectedTail){
            MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
            MultiSelectData.selectedPrev = MultiSelectDataSelectedTail;
        }
        MultiSelectDataSelectedTail = MultiSelectData;

        var removeSelectedItem = () => {
            let confirmed = setSelected(MultiSelectData.option, false);
            if (confirmed==null || confirmed) {
                MultiSelectData.excludedFromSearch = isOptionDisabled;
                if (isOptionDisabled)
                {
                    setDropDownItemContentDisabled(MultiSelectData.DropDownItemContent, false);
                    MultiSelectData.toggle = ()=> {};
                }
                else
                {
                    MultiSelectData.toggle = ()=>{
                        let confirmed = setSelected(MultiSelectData.option, true);
                        if (confirmed==null || confirmed){
                            createPick(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled);
                            triggerChange();
                        }
                    };
                }
                MultiSelectData.DropDownItemContent.select(false);
                removeElement(pickElement);
                MultiSelectData.PickContent.dispose();
                MultiSelectData.PickContent=null;
                MultiSelectData.pickElement=null;

                removeSelectedFromList(MultiSelectData);
                dec();
                triggerChange();
            }
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

        MultiSelectData.PickContent = pickContentGenerator(
            pickElement,
            MultiSelectData.option,
            onRemoveSelectedItemEvent);

        var disable = (isDisabled) =>
            MultiSelectData.PickContent.disable(isDisabled);
        disable(isComponentDisabled);

        MultiSelectData.excludedFromSearch = true; // all selected excluded from search
        MultiSelectData.disable = disable;
        picksElement.insertBefore(pickElement, pickFilterElement);
         
        MultiSelectData.toggle = () => removeSelectedItem();
        MultiSelectData.DropDownItemContent.select(true);
        inc();
    }

    var picksClick = event => {
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
        pickFilterElement,
        createPick,
        removePicksTail,
        resetMultiSelectDataSelectedTail() {
            reset();
            MultiSelectDataSelectedTail = null;
        },
        isEmpty,
        enable(){
            isComponentDisabled= false;
            iterateAll(false);
            picksElement.addEventListener("click", picksClick);

        },
        disable(){
            isComponentDisabled= true;
            iterateAll(true);
            picksElement.removeEventListener("click", picksClick);

        },
        dispose(){
            var toRemove = picksElement.firstChild;
            while( toRemove ) {
                picksElement.removeChild( toRemove );
                toRemove = picksElement.firstChild;
            }
            picksElement.removeEventListener("click", picksClick); // OPEN dropdown
        }
        
    }
    return item;
}