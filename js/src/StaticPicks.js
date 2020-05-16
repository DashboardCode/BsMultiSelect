import {removeElement} from './ToolsDom';
import {addStyling, toggleStyling} from './ToolsStyling';

export function StaticPicks(picksElement, createElement, css){
    var pickFilterElement  = createElement('LI');
    var filterInputElement = createElement('INPUT');
    
    addStyling(picksElement,       css.picks);
    addStyling(pickFilterElement,  css.pickFilter);
    addStyling(filterInputElement, css.filterInput);

    let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
    let focusToggleStyling   = toggleStyling(picksElement, css.picks_focus);
    let isFocusIn = false;

    return {
        picksElement,
        pickFilterElement,
        filterInputElement,

        createPickElement(){
            var pickElement = createElement('LI');
            addStyling(pickElement, css.pick);
            return {
                pickElement, 
                attach: () => picksElement.insertBefore(pickElement, pickFilterElement),
                detach: () => removeElement(pickElement)
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
            disableToggleStyling(false)
            focusToggleStyling(false)

            if (pickFilterElement.parentNode)
                pickFilterElement.parentNode.removeChild(pickFilterElement)
            if (filterInputElement.parentNode)
                filterInputElement.parentNode.removeChild(filterInputElement)
        }
    }
}