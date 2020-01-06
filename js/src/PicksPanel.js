import {removeElement, removeChildren, EventBinder} from './ToolsDom'
import {List} from './ToolsJs'

export function PicksPanel (
        createElement,
        picksElement, 
        init, 
        pickContentGenerator, 
        isComponentDisabled,
        //afterRemove,
        onClick, // click to open dropdown
        onPickCreated,
        onPickRemoved,
        processRemoveButtonClick // click to remove button
) 
{
    var list = List();

    var pickFilterElement = createElement('LI'); // detached
    picksElement.appendChild(pickFilterElement); // located filter in selectionsPanel
    init(pickFilterElement);

    function createPick(multiSelectData, option) {
        var pickElement = createElement('LI');
        var item = {pickElement}
        var removeFromList = list.add(item);

        var removeSelectedItem = () => {
            onPickRemoved(
                multiSelectData, 
                ()=>{
                    removeElement(pickElement);
                    item.pickContent.dispose();
                    removeFromList();
                    return {
                        createSelectedItem: ()=> {
                            createPick(multiSelectData, option);
                            onPickCreated(multiSelectData, removeSelectedItem, list.getCount());
                        },
                        count: list.getCount()
                    };
                }
            );
        }
        item.removeSelectedItem = removeSelectedItem;

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

        // let removePickAndCloseChoices = () => {
        //     removeSelectedItem();
        //     //afterRemove();
        // };
    
        let onRemoveSelectedItemEvent = (event) => {
             processRemoveButtonClick(removeSelectedItem/*() => removePickAndCloseChoices()*/, event);
        };

        item.pickContent = pickContentGenerator(
            pickElement,
            option,
            onRemoveSelectedItemEvent);

        item.pickContent.disable(isComponentDisabled);
        picksElement.insertBefore(pickElement, pickFilterElement);

        onPickCreated(multiSelectData, list.getCount(), removeSelectedItem);
    }

    var eventBinder = EventBinder();
    return {
        pickFilterElement,
        createPick,
        removePicksTail(){  
            var item = list.getTail();
            if (item) 
                item.removeSelectedItem(); // always remove in this case
        },
        isEmpty: list.isEmpty,
        enable(){
            isComponentDisabled= false;
            list.forEach(i=>i.pickContent.disable(false))
            eventBinder.bind(picksElement,"click", event => onClick(event));  // OPEN dropdown
        },
        disable(){
            isComponentDisabled= true;
            list.forEach(i=>i.pickContent.disable(true))
            eventBinder.unbind();
        },
        deselectAll(){
            list.forEach(i =>i.removeSelectedItem())
        },
        clear() {
            list.forEach(i=>removeElement(i.pickElement));
            list.reset();
        },
        dispose(){
            removeChildren(picksElement);
            eventBinder.unbind();
            list.forEach(i=>i.pickContent.dispose());
        }
    }
}