import {List} from './ToolsJs'

export function PicksList() 
{
    var list = List();
    return {
        addPick(pick) {
            var removeFromList = list.add(pick);
            return removeFromList;
        },
        removePicksTail(){  
            var pick = list.getTail();
            if (pick) 
                pick.remove(); // always remove in this case
            return pick;
        },
        isEmpty: list.isEmpty, // function
        getCount: list.getCount,
        disableRemoveAll(){
            list.forEach(i=>i.disableRemove())
        },
        removeAll(){
            list.forEach(i=>i.remove())
        },
        clear() {
            list.forEach(i=>i.dispose());
            list.reset();
        },
        dispose(){
            list.forEach(i=>i.dispose());
            
        }
    }
}