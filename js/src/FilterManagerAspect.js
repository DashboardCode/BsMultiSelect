export function NavigateManager(
    list, getPrev, getNext
){
    return {
        navigate(down, wrap /* hoveredChoice */){ 
            if (down) {
                return wrap?getNext(wrap): list.getHead();
            } else {
                return wrap?getPrev(wrap): list.getTail();
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
        filterPredicate: (wrap, text) => 
            wrap.choice.searchText.indexOf(text) >= 0    
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
    let filterText = "";
    return {
        getNavigateManager(){
            return (showEmptyFilter)?emptyNavigateManager:filteredNavigateManager;
        },
        processEmptyInput(){ // redefined in PlaceholderPulgin
            showEmptyFilter =true;
            filterText ="";
            choicesEnumerableAspect.forEach( (wrap)=>{
                wrap.choice.setVisible(true);
            });
        },
        getFilter(){
            return filterText;
        },
        setFilter(text){ 
            showEmptyFilter =false;
            filterText = text;
            filteredChoicesList.reset();
            choicesEnumerableAspect.forEach( (wrap)=>{
                wrap.choice.filteredPrev = wrap.choice.filteredNext = null;
                var v = filterPredicateAspect.filterPredicate(wrap, text)
                if (v)
                    filteredChoicesList.add(wrap);
                wrap.choice.setVisible(v);
            });
        }
    }
}
