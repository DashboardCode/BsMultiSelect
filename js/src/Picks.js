import {List} from './ToolsJs'

export function Picks() 
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
            list.forEach(pick=>pick.pickDomManagerHandlers.updateRemoveDisabled())
        },
        removeAll(){
            list.forEach(pick=>pick.remove())
        },
        clear() {
            list.forEach(pick=>pick.dispose());
            list.reset();
        },
        dispose(){
            list.forEach(pick=>pick.dispose());
            
        }
    }
}