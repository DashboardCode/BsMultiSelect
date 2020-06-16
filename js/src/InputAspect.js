export function InputAspect(
    filterManagerAspect, setOptionSelectedAspect, hoveredChoiceAspect, navigateAspect,  filterDom, popupAspect){

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
                filterManagerAspect.setFilter(text);
                if (filterManagerAspect.getNavigateManager().getCount() == 1)
                {
                    let fullMatchChoice =  filterManagerAspect.getNavigateManager().getHead();
                    if (fullMatchChoice.searchText == text)
                    {
                        setOptionSelectedAspect.setOptionSelected(fullMatchChoice, true);
                        filterDom.setEmpty();
                        isEmpty=true;
                    }
                }
            }
            if (isEmpty){
                filterManagerAspect.processEmptyInput();
            }
            else
                resetLength();  
            
            eventLoopFlag_set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover
    
            let visibleCount = filterManagerAspect.getNavigateManager().getCount();
    
            if (visibleCount>0){
                let panelIsVisble = popupAspect.isChoicesVisible();
                if (!panelIsVisble){
                    aspect_showChoices(); //multiSelectInputAspect.showChoices();
                }
                if (visibleCount == 1) {
                    navigateAspect.hoverIn(filterManagerAspect.getNavigateManager().getHead())
                } else {
                    if (panelIsVisble)
                        hoveredChoiceAspect.resetHoveredChoice();
                }   
            }else{
                if (popupAspect.isChoicesVisible())
                    aspect_hideChoices();
            }
        }
    }
}