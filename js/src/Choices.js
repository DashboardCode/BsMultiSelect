export function Choices(collection, listFacade_reset, listFacade_remove, insertFilterFacade, choicesGetNextAspect) 
{
    return {
        push: (choice) => push(choice, collection, insertFilterFacade),
        insert: (key, choice) => insert(key, choice, collection, insertFilterFacade, choicesGetNextAspect),
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

function push(choice, collection, insertFilterFacade){
    insertFilterFacade(choice);
    collection.push(choice);
}

function insert(key, choice, collection, insertFilterFacade, choicesGetNextAspect){
    if (key>=collection.getLength()) {
        push(choice, collection, insertFilterFacade);
    }
    else {
        collection.add(choice, key);
        let choiceNonhiddenBefore = choicesGetNextAspect.getNext(choice);
        insertFilterFacade(choice, choiceNonhiddenBefore);
    }
}