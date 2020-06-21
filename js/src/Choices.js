export function Choices(choicesCollection,  
    listFacade_reset, listFacade_remove, listFacade_add) 
{
    return {
        push: (choice) => push(choice, choicesCollection, listFacade_add),
        insert: (key, choice) => insert(key, choice, choicesCollection, listFacade_add),
        remove: (key) => {
            var choice = choicesCollection.remove(key);
            listFacade_remove(choice);
            return choice;
        },
        clear: () => {
            choicesCollection.reset();
            listFacade_reset();
        }, 
        dispose: () => choicesCollection.forLoop(choice => choice.dispose?.()) 
    }
}

function push(choice, choicesCollection, listFacade_add){
    choicesCollection.push(choice);
    listFacade_add(choice);
}

function insert(key, choice, choicesCollection, listFacade_add){
    if (key>=choicesCollection.getCount()) {
        push(choice, choicesCollection, listFacade_add);
    }
    else {
        choicesCollection.add(choice, key);
        listFacade_add(choice, key);
    }
}