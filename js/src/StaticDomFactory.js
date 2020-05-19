import {findDirectChildByTagName, closestByClassName} from './ToolsDom';
import {composeSync} from './ToolsJs';

export function completePicksElement(staticDom, staticManager, createElement){
    if (!staticDom.picksElement) {
        staticDom.picksElement = createElement('UL');
        staticDom.ownPicksElement = true;
        //staticManager.picksElement
        staticManager.appendToContainer = composeSync(staticManager.appendToContainer,  () => staticDom.containerElement.appendChild(staticDom.picksElement));
        staticManager.dispose = composeSync(staticManager.dispose, () => staticDom.containerElement.removeChild(staticDom.picksElement));

    }
}

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
            if (element.tagName == 'DIV') {
                containerElement = element;
                picksElement = findDirectChildByTagName(containerElement, 'UL');
            }
            else if (element.tagName == 'UL') {
                picksElement = element;
                containerElement = closestByClassName(element, containerClass);
                if (!containerElement){
                    showError('BsMultiSelect: defined on UL but precedentant DIV for container not found; class='+containerClass);
                }
            } 
            // TODO: move to new place
            // else if (element.tagName=="INPUT"){
            //    showError('BsMultiSelect: INPUT element is not supported');
            // }
            
            let staticDom = {
                initialElement:element,
                containerElement,
                picksElement
            }

            let staticManager = {
                appendToContainer(){ containerElement.appendChild(choicesElement); },
                dispose(){ containerElement.removeChild(choicesElement); }
            }
             
            completePicksElement(staticDom, staticManager, createElement);
            return {staticDom, staticManager};
        }
    }
}