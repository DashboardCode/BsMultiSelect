export function FilterFacade(
    listFacade,
    forEach,
    composeFilterPredicate 
    ) 
{
    return {
        setFilter: (text)=> { 
            let getFilterIn = composeFilterPredicate(text)
            listFacade.reset();
            forEach( (choice)=>{
                choice.filteredPrev = choice.filteredNext = null;
                var v = getFilterIn(choice);
                if (v)
                    listFacade.add(choice);
                choice.setVisible(v);
            });
        },
        resetFilter: () => {
            listFacade.reset();
            forEach( (choice)=>{
                choice.filteredPrev = choice.filteredNext = null;
                listFacade.add(choice);
                choice.setVisible(true);
            });
        },
        navigate: (down, choice) => {
            if (down) {
                return choice?choice.filteredNext: listFacade.getHead();
            } else {
                return choice?choice.filteredPrev: listFacade.getTail();
            }
        }
    }
}