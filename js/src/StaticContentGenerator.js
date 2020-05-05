import {findDirectChildByTagName, closestByClassName, removeElement} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';

// export function htmlContent(){
//     return {

//     }
// }

export function staticContentGenerator(element, createElement, containerClass, css, Popper) { 
    var selectElement = null;
    var containerElement = null;
    var picksElement = null;
    var ownPicksElement = false;

    function showError(message){
        element.style.backgroundColor = 'red';
        element.style.color = 'white';
        throw new Error(message);
    }

    if (element.tagName=='SELECT'){
        selectElement = element;
        if (containerClass){
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
                showError('BsMultiSelect: definde on UL but container parent not found');
            }
        }
    } 
    else 
    {
        showError('BsMultiSelect: only DIV and SELECT supported');
    }

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

   
    var backupDisplay = null;
    if (selectElement){ 
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
    }
    
    var required = false;
    if (selectElement){
        var backupedRequired = selectElement.required;
        if(selectElement.required===true){
            required = true;
            selectElement.required = false;
        }
    }

    var choicesElement = createElement('UL');
    choicesElement.style.display = 'none';
    
    var pickFilterElement  = createElement('LI');
    var filterInputElement = createElement('INPUT');
    
    addStyling(picksElement,       css.picks);
    addStyling(choicesElement,     css.choices);
    addStyling(pickFilterElement,  css.pickFilter);
    addStyling(filterInputElement, css.filterInput);

    let isFocusIn = false;
    let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
    let focusToggleStyling   = toggleStyling(picksElement, css.picks_focus);

    let popper = null;
    let popperConfiguration = {
        placement: 'bottom-start',
        modifiers: {
            preventOverflow: {enabled:true},
            hide: {enabled:false},
            flip: {enabled:false}
        }
    };

    return {
        initialElement:element,
        selectElement, 
        containerElement,
        pickFilterElement,
        filterInputElement,
        picksElement,

        createPickElement(){
            var pickElement = createElement('LI');
            addStyling(pickElement, css.pick);
            return {
                pickElement, 
                attach: () => picksElement.insertBefore(pickElement, pickFilterElement),
                detach: () => removeElement(pickElement)
            };
        },
        choicesElement,
        createChoiceElement(){
            var choiceElement = createElement('LI');
            addStyling(choiceElement, css.choice);
            return {
                choiceElement, 
                setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
                attach: (element) => choicesElement.insertBefore(choiceElement, element),
                detach: () => removeElement(choiceElement)
            };
        },
        required,
        attachContainer(){
            if (selectElement && ownContainerElement) // otherwise it is attached
                selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
            //if (!!Popper.prototype && !!Popper.prototype.constructor.name) {
            popper=new Popper(filterInputElement, choicesElement, popperConfiguration);
            /*}else{
                popper=Popper.createPopper(
                    filterInputElement,
                    choicesElement,
                    //  https://github.com/popperjs/popper.js/blob/next/docs/src/pages/docs/modifiers/prevent-overflow.mdx#mainaxis
                    // {
                    //     placement: isRtl?'bottom-end':'bottom-start',
                    //     modifiers: { preventOverflow: {enabled:false}, hide: {enabled:false}, flip: {enabled:false} }
                    // }
                );
            }*/
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
        popperConfiguration,
        updatePopupLocation(){
            popper.update(); 
        },
        dispose(){
            if (ownContainerElement)
                containerElement.parentNode.removeChild(containerElement);
            
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
            popper.destroy();
        }
    }
}