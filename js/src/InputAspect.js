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
            // improve it 
            return {filterInputValue, isEmpty};
        }
    }
}
