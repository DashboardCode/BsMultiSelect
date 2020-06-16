export function NavigateManager(
    list, getPrev, getNext
){
    return {
        navigate(down, choice /* hoveredChoice */){ 
            if (down) {
                return choice?getNext(choice): list.getHead();
            } else {
                return choice?getPrev(choice): list.getTail();
            }
        },
        getCount(){
            return list.getCount()
        },
        getHead(){
            return list.getHead()
        }
    }
}

export function FilterManagerAspect(
    emptyNavigateManager,
    filteredNavigateManager,

    filteredChoicesList, 
    choicesEnumerableAspect
    ) {
    let showEmptyFilter=true;
    let composeFilterPredicate = (text) => 
            (choice) => !choice.isOptionSelected  && !choice.isOptionDisabled  && choice.searchText.indexOf(text) >= 0     

    return {
        getNavigateManager(){
            return (showEmptyFilter)?emptyNavigateManager:filteredNavigateManager;
        },
        processEmptyInput(){ // redefined in PlaceholderPulgin
            showEmptyFilter =true;
            choicesEnumerableAspect.forEach( (choice)=>{
                choice.setVisible(true);
            });
        },
        setFilter(text){ 
            showEmptyFilter =false;
            let getFilterIn = composeFilterPredicate(text)
            filteredChoicesList.reset();
            choicesEnumerableAspect.forEach( (choice)=>{
                choice.filteredPrev = choice.filteredNext = null;
                var v = getFilterIn(choice);
                if (v)
                    filteredChoicesList.add(choice);
                choice.setVisible(v);
            });
        }
    }
}
