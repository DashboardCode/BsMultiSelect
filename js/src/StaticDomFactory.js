import {findDirectChildByTagName, closestByClassName} from './ToolsDom';

export function completedDomGenerator(staticDom, createElement){
    if (!staticDom.picksElement) {
        staticDom.picksElement = createElement('UL');
        staticDom.attachPicksElement = () => staticDom.containerElement.appendChild(staticDom.picksElement);
        staticDom.detachPicksElement = () => staticDom.picksElement.parentNode.removeChild(staticDom.picksElement);
    }
}

export function StaticDomFactory(createElement){
    var staticDomGenerator = (element, containerClass) => {
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
        let ownContainerElement = containerElement?false:true;
        // TODO: move to new place
        // else if (element.tagName=="INPUT"){
        //    showError('BsMultiSelect: INPUT element is not supported');
        // }
        
        let staticDom = {
            initialElement:element,
            containerElement,
            picksElement,
            ownContainerElement,
            appendChoicesToContainer(choicesElement){ containerElement.appendChild(choicesElement);},
        }
        completedDomGenerator(staticDom, createElement);
        return staticDom;
    }

    return {
        createElement,
        staticDomGenerator
    }
}