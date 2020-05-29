export function Choices(collection, listFacade_reset, listFacade_remove, addFilterFacade, insertFilterFacade) 
{

    var push = (choice) => {
        addFilterFacade(choice);
        collection.push(choice);
    }

    var item = {
        push,
        get: (key) => collection.get(key),
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
            listFacade_remove(choice);
            return choice;
        },

        //  ---- dialog AI
        getHead: () => collection.getHead(),
        forLoop: (f)=>collection.forLoop(f),
        
        
        clear:()=>{
            collection.reset();
            listFacade_reset();
        }, 
        dispose: () => collection.forLoop(choice => choice.dispose?.()) 
    }
    return item;
}