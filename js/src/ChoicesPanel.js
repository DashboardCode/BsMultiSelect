import {ListFacade, CollectionFacade} from './ToolsJs'

export function ChoicesPanel(
    getNext,
    composeFilterPredicate 
    ) 
{
    let hoveredChoice=null;
    
    let filterFacade = ListFacade(
        (choice)=>choice.prev, 
        (choice, v)=>choice.prev=v, 
        (choice)=>choice.next, 
        (choice, v)=>choice.next=v, 
    );

    function setChoices(getFilterIn) {
        filterFacade.reset();
        collection.forLoop( choice => {
            choice.prev = choice.next = null;
            //-------------------------------
            if ( !choice.isOptionHidden )
            {
                var v = getFilterIn(choice);
                if (v)
                    filterFacade.add(choice);
                choice.setVisible(v);
            }
        });
    }

    function addFilterFacade(choice){
        if ( !choice.isOptionHidden ) {
            filterFacade.add(choice);
        }
    }

    function insertFilterFacade(choice){
        if ( !choice.isOptionHidden ){
            let choiceNonhiddenBefore = getNext(choice);
            filterFacade.add(choice, choiceNonhiddenBefore);
        }
    }

    // ------------------------------------ ------------------------------------ 

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
            filterFacade.remove(choice);
            return choice;
        },

        filterOut: (choice) => filterFacade.remove(choice),
        filterIn: (choice, beforeChoice) => filterFacade.add(choice, beforeChoice),
        getFirstVisibleChoice: ()=> filterFacade.getHead(),
        getVisibleCount: () => filterFacade.getCount(),
        getHasVisible: () => filterFacade.getCount()>0,
        setFilter: (text)=> setChoices(composeFilterPredicate(text)),
        resetFilter: () => setChoices(()=>true),
        forEach: (f)=>collection.forLoop(f),
        getHoveredChoice: () => hoveredChoice,
        hoverIn(choice){
            resetHoveredChoice(); 
            hoveredChoice = choice;
            hoveredChoice.setHoverIn(true)
        },
        resetHoveredChoice,
        navigate: (down) => {
            if (down) {
                return hoveredChoice?hoveredChoice.next: filterFacade.getHead();
            } else {
                return hoveredChoice?hoveredChoice.prev: filterFacade.getTail();
            }
        },
        clear:()=>{
            collection.reset();
            filterFacade.reset();
        },
        dispose: () => collection.forLoop(choice => choice.dispose?.())
    }
    return item;
}