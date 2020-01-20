import {findDirectChildByTagName, closestByClassName} from './ToolsDom';
import  {setStyling, unsetStyling} from './ToolsStyling';

export function staticContentGenerator(element, createElement, containerClass, css) { 
    var selectElement = null;
    var containerElement = null;
    if (element.tagName=='SELECT'){
        selectElement = element;
        if (containerClass){
            containerElement = closestByClassName(selectElement, containerClass)
            // TODO: do I need this?    
            //if (selectElement.nextSibling  && selectElement.nextSibling.classList.contains(containerClass) )
            //    containerElement = selectElement.parentNode;
        }
    }
    else if (element.tagName=="DIV")
    { 
        containerElement = element;
        selectElement = findDirectChildByTagName(element, 'SELECT');
    }
    else 
    {
        element.style.backgroundColor = 'red';
        element.style.color = 'white';
        throw new Error('BsMultiSelect: Only DIV and SELECT supported');
    }


    var picksElement = null;
    var ownPicksElement = false;
    if (containerElement)
        picksElement = findDirectChildByTagName(containerElement, 'UL');
    if (!picksElement){
        picksElement = createElement('UL');
        ownPicksElement = true;
    }

    var ownContainerElement = false;        
    if (!containerElement){
        containerElement = createElement('DIV');
        ownContainerElement= true;
    }
    containerElement.classList.add(containerClass);

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

    setStyling(picksElement,       css.picks);
    setStyling(choicesElement,     css.choices);
    setStyling(pickFilterElement,  css.pickFilter);
    setStyling(filterInputElement, css.filterInput);

    var createInputId = null;
    if(selectElement)
        createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    else
        createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

    return {
        selectElement, 
        containerElement,
        picksElement,
        choicesElement,
        pickFilterElement,
        filterInputElement,
        createInputId,
        // init(){
        //     if (ownPicksElement)
        //         containerElement.appendChild(picksElement);
        // },
        attachContainer(){
            if (ownContainerElement && selectElement) // otherwise it is attached
                selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
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
                    // TODO picksElement element should be moved to attach
                    selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
                    if (ownPicksElement)
                        selectElement.parentNode.insertBefore(picksElement, choicesElement);
                }
            }
        },
        enable(){
            unsetStyling(picksElement, css.picks_disabled)
        },

        disable(){
            setStyling(picksElement, css.picks_disabled)
        },

        focusIn(){
            setStyling(picksElement, css.picks_focus)
        },

        focusOut(){
            unsetStyling(picksElement, css.picks_focus)
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