import {addStyling} from './ToolsStyling';

export function FilterDom(disposablePicksElement, createElementAspect, css){
    var filterInputElement = createElementAspect.createElement('INPUT');
    addStyling(filterInputElement, css.filterInput);

    filterInputElement.setAttribute("type","search");
    filterInputElement.setAttribute("autocomplete","off");

    return {
        filterInputElement,
        isEmpty: () => filterInputElement.value ? false:true,
        setEmpty(){
            filterInputElement.value ='';
        },
        setFocus(){
            filterInputElement.focus();
        },
        // TODO: check why I need this comparision? 
        setFocusIfNotTarget(target){
            if (target != filterInputElement)
                filterInputElement.focus();
        },
        dispose(){
            if (!disposablePicksElement){
                if (filterInputElement.parentNode)
                    filterInputElement.parentNode.removeChild(filterInputElement)
            }
        }
    }
}
