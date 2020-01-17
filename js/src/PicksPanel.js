import {removeElement} from './ToolsDom'
import {List} from './ToolsJs'

export function PicksPanel (
        createElement,
        pickContentGenerator, 
        requestPickCreate,
        requestPickRemove,
        processRemoveButtonClick // click to remove button
) 
{
    var list = List();
    function createPick(multiSelectData, option, isComponentDisabled) {
        var {pickElement, attach} = createElement();
        var item = {pickElement}
        var removeFromList = list.add(item);

        var removeSelectedItem = () => {
            requestPickRemove(
                multiSelectData, 
                () => {
                    removeElement(pickElement);
                    item.pickContent.dispose();
                    removeFromList();
                    return {
                        createPick: createPick,
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
    
        item.pickContent = pickContentGenerator(pickElement);
        item.pickContent.setData(option);
        item.pickContent.disable(isComponentDisabled);
        item.pickContent.onRemove( (event) => {
            processRemoveButtonClick(removeSelectedItem, event);
        });
        attach();
        requestPickCreate(multiSelectData, removeSelectedItem, list.getCount());
    }

    return {
        createPick,
        removePicksTail(){  
            var item = list.getTail();
            if (item) 
                item.removeSelectedItem(); // always remove in this case
        },
        isEmpty: list.isEmpty,
        disable(isComponentDisabled){
            list.forEach(i=>i.pickContent.disable(isComponentDisabled))
        },
        deselectAll(){
            list.forEach(i =>i.removeSelectedItem())
        },
        clear() {
            list.forEach(i=>removeElement(i.pickElement));
            list.reset();
        },
        dispose(){
            list.forEach(i=>{
                i.pickContent.dispose();
                removeElement(i.pickElement);
            });
        }
    }
}