export function Wraps(wrapsCollection,  
    listFacade_reset, listFacade_remove, listFacade_add) 
{
    return {
        push: (wrap) => push(wrap, wrapsCollection, listFacade_add),
        insert: (key, wrap) => insert(key, wrap, wrapsCollection, listFacade_add),
        remove: (key) => {
            var wrap = wrapsCollection.remove(key);
            listFacade_remove(wrap);
            return wrap;
        },
        clear: () => {
            wrapsCollection.reset();
            listFacade_reset();
        }, 
        dispose: () => wrapsCollection.forLoop(wrap => wrap.dispose()) 
    }
}

function push(wrap, wrapsCollection, listFacade_add){
    wrapsCollection.push(wrap);
    listFacade_add(wrap);
}

function insert(key, wrap, wrapsCollection, listFacade_add){
    if (key>=wrapsCollection.getCount()) {
        push(wrap, wrapsCollection, listFacade_add);
    }
    else {
        wrapsCollection.add(wrap, key);
        listFacade_add(wrap, key);
    }
}