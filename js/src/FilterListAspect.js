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

export function FilterPredicateAspect(){
    return {
        filterPredicate: (choice, text) => 
            !choice.isOptionSelected  && choice.searchText.indexOf(text) >= 0    
    }
}

export function FilterManagerAspect(
    emptyNavigateManager,
    filteredNavigateManager,
    filteredChoicesList, 
    choicesEnumerableAspect,
    filterPredicateAspect
    ) {
    let showEmptyFilter=true;

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
            filteredChoicesList.reset();
            choicesEnumerableAspect.forEach( (choice)=>{
                choice.filteredPrev = choice.filteredNext = null;
                var v = filterPredicateAspect.filterPredicate(choice, text)
                if (v)
                    filteredChoicesList.add(choice);
                choice.setVisible(v);
            });
        }
    }
}
