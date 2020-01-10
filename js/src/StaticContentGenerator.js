import {setStyles, setStyling, unsetStyling} from './ToolsDom';

export function staticContentGenerator(containerClass, stylings, createElement, selectElement, containerElement, picksElement) { 
    var ownContainerElement = false;
    
    if (!containerElement){
        containerElement = createElement('div');
        ownContainerElement= true;
    }
    setStyling(containerElement, containerClass);

    var ownPicksElement = false;
    if (!picksElement){
        picksElement = createElement('UL');
        ownPicksElement = true;
    }


    var choicesElement = createElement('UL');
    choicesElement.style.display="none";

    
    var backupDisplay = null;
    if (selectElement)
    { 
        backupDisplay = selectElement.style.display;
        selectElement.style.display='none';
    }
    
    var pickFilterElement = createElement('LI');
    var filterInputElement = createElement('INPUT');

    setStyling(picksElement,       stylings.picks);
    setStyling(choicesElement,     stylings.choices);
    setStyling(pickFilterElement,  stylings.pickFilter);
    setStyling(filterInputElement, stylings.filterInput);

    return {
        containerElement,
        picksElement,
        choicesElement,
        pickFilterElement,
        filterInputElement,
        init(){
            if (ownPicksElement)
                containerElement.appendChild(picksElement);
        },
        appendToContainer(){
            if (ownContainerElement || !selectElement)            
            {
                if (ownPicksElement)
                    containerElement.appendChild(picksElement);
                containerElement.appendChild(choicesElement);
            }
            else
            {
                if (selectElement)
                {
                    selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
                    if (ownPicksElement)
                        selectElement.parentNode.insertBefore(picksElement, choicesElement);
                }
            }
        },
        attachContainer(){
            if (ownContainerElement)
                selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
        },
        enable(){
            unsetStyling(picksElement, stylings.picks_disabled)
        },

        disable(){
            setStyles(picksElement, stylings.picks_disabled)
        },

        focusIn(){
            setStyles(picksElement, stylings.picks_focus)
        },

        focusOut(){
            unsetStyling(picksElement, stylings.picks_focus)
        },        
        dispose(){
            if (ownContainerElement)
                containerElement.parentNode.removeChild(containerElement);
            if (ownPicksElement)
                picksElement.parentNode.removeChild(picksElement);
            choicesElement.parentNode.removeChild(choicesElement);
            if (pickFilterElement.parentNode)
                pickFilterElement.parentNode.removeChild(pickFilterElement);
            if (filterInputElement.parentNode)
                filterInputElement.parentNode.removeChild(filterInputElement);
            if (selectElement)
                selectElement.style.display = backupDisplay;
        }
    }
}