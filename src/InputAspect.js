export function InputAspect(
    filterDom,
    filterManagerAspect
    ){

    return {
        // overrided in SelectedOptionPlugin
        processInput(){ 
            let filterInputValue = filterDom.getValue();
            let text = filterInputValue.trim();
            var isEmpty=false;
            if (text == '')
                isEmpty=true;
            else
            {
                filterManagerAspect.setFilter(text.toLowerCase());
            }
            
            if (!isEmpty)
            {
                if ( filterManagerAspect.getNavigateManager().getCount() == 1)
                {
                    // todo: move exact match to filterManager
                    let fullMatchWrap =  filterManagerAspect.getNavigateManager().getHead();
                    let text = filterManagerAspect.getFilter();
                    if (fullMatchWrap.choice.searchText == text)
                    {
                        let success = fullMatchWrap.choice.fullMatch(); 
                        if (success) {
                            filterDom.setEmpty();
                            isEmpty = true;
                        }
                    }
                }
            }

            return {filterInputValue, isEmpty};
        }
    }
}