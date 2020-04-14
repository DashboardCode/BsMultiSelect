import {ListFacade} from './ToolsJs'
import {getNextNonHidden} from './Choice'
function setChoices(forEach, filterFacade, getFilterIn) {
    filterFacade.reset();
    forEach( choice => {
        choice.prev = choice.next = null;
        if ( !choice.isOptionHidden )
        {
            var v = getFilterIn(choice);
            if (v)
                filterFacade.add(choice);
            choice.setVisible(v);
        }
    });
}

export function ChoicesPanel() 
{
    let choicesList = [];
    let hoveredChoice=null;
    let filterFacade = ListFacade(
        (choice)=>choice.prev, 
        (choice, v)=>choice.prev=v, 
        (choice)=>choice.next, 
        (choice, v)=>choice.next=v, 
    );

    let listFacade = ListFacade(
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

    function forEach(processChoice){
        for(let i=0; i<choicesList.length; i++)
        {
            let choice = choicesList[i];
            processChoice(choice);
        }
    }

    var push = (choice) => {
        if (!choice.isOptionHidden){
            filterFacade.add(choice);
        }
        listFacade.add(choice);
        choicesList.push(choice);
    }
    var item = {
        push,
        get: (key) => choicesList[key],
        add: (key, choice) => {
            if (key>=choicesList.length) {
                push(choice);
            }
            else {
                let choiceBefore = choicesList[key];
                listFacade.add(choice, choiceBefore);
                choicesList.splice(key, 0, choice);
                if (!choice.isOptionHidden){
                    let choiceNonhiddenBefore = getNextNonHidden(choice);
                    filterFacade.add(choice, choiceNonhiddenBefore);
                }
            }
        },
        remove: (key) => {
            var choice = choicesList[key];
            filterFacade.remove(choice);
            listFacade.remove(choice);
            choicesList.splice(key, 1);
        },
        updateHiddenOn: (choice) => {
            filterFacade.remove(choice);
        },
        updateHiddenOff: (choice, beforeChoice) => {
            filterFacade.add(choice, beforeChoice);
        },
        forEach,
        getFirstVisibleChoice: ()=> filterFacade.getHead(),
        getVisibleCount: () => filterFacade.getCount(),
        getHasVisible: () => filterFacade.getCount()>0,
        getHoveredChoice: () => hoveredChoice,
        hoverIn(choice){
            resetHoveredChoice(); 
            hoveredChoice = choice;
            hoveredChoice.setHoverIn(true)
        },
        resetHoveredChoice,
        
        setFilter: (text)=>
            setChoices(forEach, filterFacade, choice=>!choice.isOptionSelected 
                && !choice.isOptionDisabled 
                && choice.searchText.indexOf(text)>=0 ),
        
        resetFilter: () => 
            setChoices(forEach, filterFacade, ()=>true),
        
        navigate: (down) => {
            if (down) {
                return hoveredChoice?hoveredChoice.next: filterFacade.getHead();
            } else {
                return hoveredChoice?hoveredChoice.prev: filterFacade.getTail();
            }
        },
        clear:()=>{
            choicesList = [];
            filterFacade.reset();
            listFacade.reset();
        },
        dispose:()=>{
            forEach(function(choice){
                if (choice.dispose){
                    choice.dispose();
                }
            });
        }
    }
    return item;
}