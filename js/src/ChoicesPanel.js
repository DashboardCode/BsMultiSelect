import {ListFacade} from './ToolsJs'

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

    var item = {
        push : (choice) => {
            if (!choice.isOptionHidden)
                filterFacade.add(choice);
            choicesList.push(choice);
        },
        get: (key) => choicesList[key],
        add: (key, choice) => {
            if (!choice.isOptionHidden){
                if (key==0)
                    filterFacade.add(choice);
                else {
                    var keyAfter = key-1;
                    var afterChoice = choicesList[keyAfter];
                    
                    while(afterChoice.isOptionHidden)
                    {
                        keyAfter--;
                        afterChoice = choicesList[keyAfter];
                    }
                    filterFacade.add(choice, afterChoice);
                }
            }
            choicesList.splice(key, 0, choice);
        },
        remove: (key) => {
            filterFacade.remove(choicesList[key]);
            choicesList.splice(key, 1);
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