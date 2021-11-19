import {findDirectChildByTagName, closestByClassName} from './ToolsDom';

export function StaticDomFactory(createElementAspect){
    return {
        create(choicesDomFactory, filterDomFactory, picksDomFactory){
            let choicesDom = choicesDomFactory.create();
            return {
                createStaticDom(element, containerClass){
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
                    let isDisposablePicksElement=false;
                    if (!picksElement) {
                        picksElement = createElementAspect.createElement('UL');
                        isDisposablePicksElement = true; 
                    }

                    let filterDom = filterDomFactory.create(isDisposablePicksElement);
                    let picksDom  = picksDomFactory.create(picksElement, isDisposablePicksElement);
                
                    return {
                        choicesDom,
                        filterDom,
                        picksDom,
                        staticDom: {
                            initialElement:element,
                            containerElement,
                            picksElement,
                            isDisposablePicksElement
                        },
                        staticManager: {
                            appendToContainer(){ 
                                containerElement.appendChild(choicesDom.choicesElement); 
                                if (isDisposablePicksElement)
                                    containerElement.appendChild(picksElement)
                            },
                            dispose(){ 
                                containerElement.removeChild(choicesDom.choicesElement); 
                                if (removableContainerClass)
                                    containerElement.classList.remove(containerClass);
                                if (isDisposablePicksElement)
                                    containerElement.removeChild(picksElement)
                            }
                        }
                    };
                }
            }
        }
    }
}