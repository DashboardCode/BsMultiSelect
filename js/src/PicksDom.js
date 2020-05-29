import {addStyling, toggleStyling} from './ToolsStyling';

export function FilterDom(disposablePicksElement, createElement, css){
    var filterInputElement = createElement('INPUT');
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

export function PicksDom(picksElement, disposablePicksElement, createElement, css){
    var pickFilterElement  = createElement('LI');
    
    addStyling(picksElement,       css.picks);
    addStyling(pickFilterElement,  css.pickFilter);


    let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
    let focusToggleStyling   = toggleStyling(picksElement, css.picks_focus);
    let isFocusIn = false;

    return {
        picksElement,
        pickFilterElement,

        createPickElement(){
            var pickElement = createElement('LI');
            addStyling(pickElement, css.pick);
            return {
                pickElement, 
                attach: () => picksElement.insertBefore(pickElement, pickFilterElement),
                detach: () => picksElement.removeChild(pickElement)
            };
        },
        disable(isComponentDisabled){
            disableToggleStyling(isComponentDisabled)
        },
        toggleFocusStyling(){
            focusToggleStyling(isFocusIn)
        },
        getIsFocusIn(){
            return isFocusIn;
        },
        setIsFocusIn(newIsFocusIn){
            isFocusIn = newIsFocusIn
        }, 
        
        dispose(){
            if (!disposablePicksElement){
                disableToggleStyling(false)
                focusToggleStyling(false)
                
                if (pickFilterElement.parentNode)
                    pickFilterElement.parentNode.removeChild(pickFilterElement)
            }
        }
    }
}