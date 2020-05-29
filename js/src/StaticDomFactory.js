import {findDirectChildByTagName, closestByClassName} from './ToolsDom';

export function StaticDomFactory(createElement, choicesElement){
    return {
        createElement,
        choicesElement,
        staticDomGenerator(element, containerClass){
            function showError(message){
                element.style.backgroundColor = 'red';
                element.style.color = 'white';
                throw new Error(message);
            }
           
            let containerElement, picksElement;
            let removableContainerClass= false;
            if (element.tagName == 'DIV') {
                containerElement = element;
                if (!containerElement.classList.contains(containerClass)){
                    containerElement.classList.add(containerClass);
                    removableContainerClass = true;
                }
                picksElement = findDirectChildByTagName(containerElement, 'UL');
            }
            else if (element.tagName == 'UL') {
                picksElement = element;
                containerElement = closestByClassName(element, containerClass);
                if (!containerElement){
                    showError('BsMultiSelect: defined on UL but precedentant DIV for container not found; class='+containerClass);
                }
            } 
            else if (element.tagName=="INPUT"){
                showError('BsMultiSelect: INPUT element is not supported');
            }
            let disposablePicksElement=false;
            if (!picksElement) {
                picksElement = createElement('UL');
                disposablePicksElement = true; 
            }
        
            return {
                staticDom: {
                            initialElement:element,
                            containerElement,
                            picksElement,
                            disposablePicksElement
                },
                staticManager: {
                    appendToContainer(){ 
                        containerElement.appendChild(choicesElement); 
                        if (disposablePicksElement)
                            containerElement.appendChild(picksElement)
                    },
                    dispose(){ 
                        containerElement.removeChild(choicesElement); 
                        if (removableContainerClass)
                            containerElement.classList.remove(containerClass);
                        if (disposablePicksElement)
                            containerElement.removeChild(picksElement)
                    }
                }
            };
        }
    }
}