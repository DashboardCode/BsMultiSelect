export function ChoicesGetNextAspect(getHead, getNext){
    return {
        getHead, 
        getNext
    }
}

   
export function ChoicesEnumerableAspect(choicesGetNextAspect){
    return {
        forEach(f){
            let choice =  choicesGetNextAspect.getHead(); // this.choices.getHead()
            while(choice){
                f(choice);
                choice = choicesGetNextAspect.getNext(choice);
            }
        }
    }
}

export function FilterListAspect(filteredChoicesList, choicesEnumerableAspect) {
    let composeFilterPredicate = (text) => 
            (choice) => !choice.isOptionSelected  && !choice.isOptionDisabled  && choice.searchText.indexOf(text) >= 0     

    return {
        insertFilterFacade(choice, choiceNonhiddenBefore){ // redefined in HidenOptionPulgin
            filteredChoicesList.add(choice, choiceNonhiddenBefore);
        },
        navigate(down, choice /* hoveredChoice */){ 
            if (down) {
                return choice?choice.filteredNext: filteredChoicesList.getHead();
            } else {
                return choice?choice.filteredPrev: filteredChoicesList.getTail();
            }
        },        
        processEmptyInput(){ // redefined in PlaceholderPulgin
            filteredChoicesList.reset();
            choicesEnumerableAspect.forEach( (choice)=>{
                choice.filteredPrev = choice.filteredNext = null;
                filteredChoicesList.add(choice);
                choice.setVisible(true);
            });
        },
        setFilter(text){ 
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
