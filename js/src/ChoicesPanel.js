import {CollectionFacade} from './ToolsJs'

export function ChoicesPanel(listFacade, navigate, addFilterFacade, insertFilterFacade) 
{
    let hoveredChoice=null;

    let collection = CollectionFacade(
        (choice)=>choice.itemPrev, 
        (choice, v)=>choice.itemPrev=v, 
        (choice)=>choice.itemNext, 
        (choice, v)=>choice.itemNext=v, 
    );

    function resetHoveredChoice() {
        if (hoveredChoice) {
            hoveredChoice.setHoverIn(false)
            hoveredChoice = null;
        }
    }

    var push = (choice) => {
        addFilterFacade(choice);
        collection.push(choice);
    }

    var item = {
        push,
        get: (key) => collection.get(key),
        getHead: () => collection.getHead(),
        insert: (key, choice) => {
            if (key>=collection.getLength()) {
                push(choice);
            }
            else {
                collection.add(choice, key);
                insertFilterFacade(choice);
            }
        },
        remove: (key) => {
            var choice = collection.remove(key);
            listFacade.remove(choice);
            return choice;
        },
        
        forLoop: (f)=>collection.forLoop(f),
        getHoveredChoice: () => hoveredChoice,
        hoverIn(choice){
            resetHoveredChoice(); 
            hoveredChoice = choice;
            hoveredChoice.setHoverIn(true)
        },
        resetHoveredChoice,
        navigate: (down) => navigate(down, hoveredChoice),
        
        clear:()=>{
            collection.reset();
            listFacade.reset();
        },
        dispose: () => collection.forLoop(choice => choice.dispose?.())
    }
    return item;
}