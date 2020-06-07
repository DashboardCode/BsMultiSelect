export function InputAspect(
    filterListAspect, choiceAspect, filterDom, 
    popupAspect, choicesHover){

    return {
        input(filterInputValue, resetLength, 
            eventLoopFlag_set, //multiSelectInputAspect.eventLoopFlag.set(); 
            aspect_showChoices, //multiSelectInputAspect.showChoices();
            aspect_hideChoices// multiSelectInputAspect.hideChoices();
            ){
            let text = filterInputValue.trim().toLowerCase();
            var isEmpty=false;
            if (text == '')
                isEmpty=true;
            else
            {
                // check if exact match, otherwise new search
                filterListAspect.setFilter(text);
                if (filterListAspect.getCount() == 1)
                {
                    let fullMatchChoice =  filterListAspect.getHead();
                    if (fullMatchChoice.searchText == text)
                    {
                        choiceAspect.setOptionSelected(fullMatchChoice, true);
                        filterDom.setEmpty();
                        isEmpty=true;
                    }
                }
            }
            if (isEmpty){
                filterListAspect.processEmptyInput();
            }
            else
                resetLength();  
            
            eventLoopFlag_set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover
    
            let visibleCount = filterListAspect.getCount();
    
            if (visibleCount>0){
                let panelIsVisble = popupAspect.isChoicesVisible();
                if (!panelIsVisble){
                    aspect_showChoices(); //multiSelectInputAspect.showChoices();
                }
                if (visibleCount == 1) {
                    choicesHover.hoverIn(filterListAspect.getHead())
                } else {
                    if (panelIsVisble)
                        choicesHover.resetHoveredChoice();
                }   
            }else{
                if (popupAspect.isChoicesVisible())
                    aspect_hideChoices();
            }
        }
    }
}