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
                isEmpty=setSelectedIfExactMatch(text);
            }
            if (isEmpty){
                filterManagerAspect.processEmptyInput();
            }
            else
                filterDom.setWidth(filterInputValue);  
        }
    }
}