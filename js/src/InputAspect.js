export function InputAspect(
    filterDom,
    filterManagerAspect, 
    setSelectedIfExactMatch
    ){

    return {
        processInput(){
            let filterInputValue = filterDom.getValue();
            let text = filterInputValue.trim().toLowerCase();
            var isEmpty=false;
            if (text == '')
                isEmpty=true;
            else
            {
                filterManagerAspect.setFilter(text);
                // check if exact match inside
                isEmpty=setSelectedIfExactMatch.setSelectedIfExactMatch(text);
            }
            if (isEmpty){
                filterManagerAspect.processEmptyInput();
            }
            else
                filterDom.setWidth(filterInputValue);  
        }
    }
}

export function SetSelectedIfExactMatch(filterDom,
    filterManagerAspect){
    return {
        setSelectedIfExactMatch(text){
            let wasSetEmpty = false;
            if ( filterManagerAspect.getNavigateManager().getCount() == 1)
            {
                let fullMatchChoice =  filterManagerAspect.getNavigateManager().getHead();
                if (fullMatchChoice.searchText == text)
                {
                    setOptionSelectedAspect.setOptionSelected(fullMatchChoice, true);
                    filterDom.setEmpty();
                    wasSetEmpty = true;
                }
            }
            return wasSetEmpty;
        }
    }
}
