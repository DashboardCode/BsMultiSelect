import {findDirectChildByTagName, closestByClassName, AttributeBackup} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

export function staticContentGenerator(element, createElement, containerClass, forceRtlOnContainer, css) { 
    var selectElement = null;
    var containerElement = null;
    var picksElement = null;
    var ownPicksElement = false;
    if (element.tagName=='SELECT'){
        selectElement = element;
        if (containerClass){
            //if (selectElement.nextSibling  && selectElement.nextSibling.classList.contains(containerClass) )
            //    containerElement = selectElement.nextSibling;
            //else 
                containerElement = closestByClassName(selectElement, containerClass)
        }
    }
    else if (element.tagName=="DIV" || element.tagName=="UL" )
    {
        if (element.tagName=="DIV"){ 
            containerElement = element;
            selectElement = findDirectChildByTagName(element, 'SELECT');
        } else /*UL*/ {
            picksElement = element;
            containerElement = closestByClassName(element, containerClass);
            if (!containerElement){
                // TODO: create error message submethod
                element.style.backgroundColor = 'red';
                element.style.color = 'white';
                throw new Error('BsMultiSelect: definde on UL but container parent not found');
            }
        }
    } 
    else 
    {
        element.style.backgroundColor = 'red';
        element.style.color = 'white';
        throw new Error('BsMultiSelect: Only DIV and SELECT supported');
    }


    if (containerElement)
        picksElement = findDirectChildByTagName(containerElement, 'UL');
    if (!picksElement){
        picksElement = createElement('UL');
        ownPicksElement = true;
    }
    
    var createPickElement = () => {
        var pickElement = createElement('LI');
        addStyling(pickElement, css.pick);
        return {
            pickElement, 
            attach: () => 
                picksElement.insertBefore(pickElement, pickFilterElement)
        };
    }

    var createChoiceElement = () => {
        var choiceElement = createElement('LI');
        addStyling(choiceElement, css.choice);
        return {
            choiceElement, 
            setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
            attach: (element) => { 
                if (element)
                    element.parentNode.insertBefore(choiceElement, element.nextSibling);
                else
                    choicesElement.insertBefore(choiceElement, choicesElement.firstChild);
            }
        };
    }

    var ownContainerElement = false;        
    if (!containerElement){
        containerElement = createElement('DIV');
        ownContainerElement= true;
    }
    containerElement.classList.add(containerClass);

    var attributeBackup = AttributeBackup();
    if (forceRtlOnContainer){
        attributeBackup.set(containerElement, "dir", "rtl");
    }
    else if (selectElement){
        var dirAttributeValue = selectElement.getAttribute("dir");
        if (dirAttributeValue){
            attributeBackup.set(containerElement, "dir", dirAttributeValue);
        }
    } 

    var choicesElement = createElement('UL');
    choicesElement.style.display = 'none';
    
    var backupDisplay = null;
    if (selectElement){ 
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
    }
    
    var pickFilterElement = createElement('LI');
    var filterInputElement = createElement('INPUT');
    var required = false;
    if (selectElement){
        var backupedRequired = selectElement.required;
        if(selectElement.required===true){
            required = true;
            selectElement.required = false;
        }
    }

    addStyling(picksElement,       css.picks);
    addStyling(choicesElement,     css.choices);
    addStyling(pickFilterElement,  css.pickFilter);
    addStyling(filterInputElement, css.filterInput);

    var createInputId = null;
    if(selectElement)
        createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    else
        createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

    let isFocusIn = false;
    let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
    let focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
    return {
        initialElement:element,
        selectElement, 
        containerElement,
        picksElement,
        createPickElement,
        choicesElement,
        createChoiceElement,
        pickFilterElement,
        filterInputElement,
        createInputId,
        required,
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
        disable(isComponentDisabled){
            disableToggleStyling(isComponentDisabled)
        },
        getIsFocusIn(){
            return isFocusIn;
        },
        setIsFocusIn(newIsFocusIn){
            isFocusIn = newIsFocusIn;
        },
        toggleFocusStyling(){
            focusToggleStyling(isFocusIn)
        },
        isChoicesVisible(){
            return choicesElement.style.display != 'none';
        },
        setChoicesVisible(visible){
            choicesElement.style.display = visible?'block':'none';
        },
        dispose(){
            if (ownContainerElement)
                containerElement.parentNode.removeChild(containerElement);
            else
                attributeBackup.restore();
            if (ownPicksElement){
                picksElement.parentNode.removeChild(picksElement);
            }else{
                // remove styles, TODO: find something better?
                disableToggleStyling(false);
                focusToggleStyling(false); 
            }
            choicesElement.parentNode.removeChild(choicesElement);
            if (pickFilterElement.parentNode)
                pickFilterElement.parentNode.removeChild(pickFilterElement);
            if (filterInputElement.parentNode)
                filterInputElement.parentNode.removeChild(filterInputElement);
            if (selectElement){
                selectElement.required = backupedRequired;
                selectElement.style.display = backupDisplay;
            }
        }
    }
}