import {findDirectChildByTagName, closestByClassName} from './ToolsDom';

// export function CompletedDomFactory(staticDomFactory){
//     staticDomFactory.staticDomGenerator 
//     return {
//         staticDomGenerator
//         appendToContainer: (choicesElement) => containerElement.appendChild(choicesElement),
//         ownContainerElement: containerElement?false:true
//     }
// }

export function StaticDomFactory(){

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
    
        // TODO: move to new place
        // else if (element.tagName=="INPUT"){
        //    showError('BsMultiSelect: INPUT element is not supported');
        // }
        return {
            initialElement:element,
            containerElement,
            picksElement
        }
    }
    
    var completedDomGenerator = (staticDom, createElement) => {
        let attachPicksElement = null;
        let detachPicksElement = null;
        if (!staticDom.picksElement) {
            staticDom.picksElement = createElement('UL');
            attachPicksElement = () => staticDom.containerElement.appendChild(staticDom.picksElement);
            detachPicksElement = () => staticDom.picksElement.parentNode.removeChild(staticDom.picksElement);
        }
    
        return {
            attachPicksElement,
            detachPicksElement
        }
    }

    return {
        staticDomGenerator,
        completedDomGenerator
    }
}