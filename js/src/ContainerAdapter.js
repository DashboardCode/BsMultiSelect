import {setStyles} from './ToolsDom'

const picksStyle = {display:'flex', flexWrap:'wrap', listStyleType:'none'};  // remove bullets since this is ul

export function ContainerAdapter(createElement, selectElement, containerElement, picksElement) { // select
    var ownContainerElement = false;
    var ownPicksElement = false;
    
    if (!containerElement){
        containerElement = createElement('div');
        ownContainerElement= true;
    }
    if (!picksElement){
        picksElement = createElement('UL');
        ownPicksElement = true;
    }
    setStyles(picksElement, picksStyle); 
    
    var choicesElement = createElement('UL');
    choicesElement.style.display="none";
    
    var backupDisplay = null;
    if (selectElement)
    { 
        backupDisplay = selectElement.style.display;
        selectElement.style.display='none';
    }
    
    return {
        containerElement,
        picksElement,
        choicesElement,
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
        dispose(){
            if (ownContainerElement)
                containerElement.parentNode.removeChild(containerElement);
            if (ownPicksElement)
                picksElement.parentNode.removeChild(picksElement);
            choicesElement.parentNode.removeChild(choicesElement);
            if (selectElement)
                selectElement.style.display = backupDisplay;
        }
    }
}