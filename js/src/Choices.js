export function Choices(collection, listFacade_reset, listFacade_remove, addFilterFacade, insertFilterFacade) 
{
    return {
        push: (choice) => push(choice, collection, addFilterFacade),
        insert: (key, choice) => insert(key, choice, collection, addFilterFacade, insertFilterFacade),
        get: (key) => collection.get(key),
        remove: (key) => {
            var choice = collection.remove(key);
            listFacade_remove(choice);
            return choice;
        },

        //  ---- dialog AI
        getHead: ()  => collection.getHead(),
        forLoop: (f) => collection.forLoop(f),
        
        clear:()=>{
            collection.reset();
            listFacade_reset();
        }, 
        dispose: () => collection.forLoop(choice => choice.dispose?.()) 
    }
}

function push(choice, collection, addFilterFacade){
    addFilterFacade(choice);
    collection.push(choice);
}

function insert(key, choice, collection, addFilterFacade, insertFilterFacade){
    if (key>=collection.getLength()) {
        push(choice, collection, addFilterFacade);
    }
    else {
        collection.add(choice, key);
        insertFilterFacade(choice);
    }
}