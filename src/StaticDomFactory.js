import {findDirectChildByTagName, closestByClassName} from './ToolsDom';

export function StaticDomFactory(staticDom){
    return {
        createStaticDom(){
            let {createElementAspect, initialElement, containerClass} = staticDom;

            let containerElement, picksElement;
            let removableContainerClass= false;
            if (initialElement.tagName == 'DIV') {
                containerElement = initialElement;
                if (!containerElement.classList.contains(containerClass)){
                    containerElement.classList.add(containerClass);
                    removableContainerClass = true;
                }
                picksElement = findDirectChildByTagName(containerElement, 'UL');
            }
            else if (initialElement.tagName == 'UL') {
                picksElement = initialElement;
                containerElement = closestByClassName(initialElement, containerClass);
                if (!containerElement){
                    throw new Error('BsMultiSelect: defined on UL but precedentant DIV for container not found; class='+containerClass);
                }
            } 
            else if (initialElement.tagName=="INPUT") {
                throw new Error('BsMultiSelect: INPUT element is not supported');
            }
            
            
            let isDisposablePicksElementFlag=false;
            if (!picksElement) {
                picksElement = createElementAspect.createElement('UL');
                isDisposablePicksElementFlag = true; 
            }
            staticDom.containerElement = containerElement;
            staticDom.isDisposablePicksElementFlag = isDisposablePicksElementFlag;
            staticDom.picksElement = picksElement;

            return {
                staticManager: {
                    appendToContainer(){ 
                        let {containerElement, isDisposablePicksElementFlag, choicesDom, picksDom, filterDom} = staticDom;
                        picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
                        picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
                        containerElement.appendChild(choicesDom.choicesElement); 
                        if (isDisposablePicksElementFlag)
                            containerElement.appendChild(picksDom.picksElement)
                    },
                    dispose(){ 
                        let {containerElement, containerClass, isDisposablePicksElementFlag, choicesDom, picksDom, filterDom} = staticDom;
                        containerElement.removeChild(choicesDom.choicesElement); 
                        if (removableContainerClass)
                            containerElement.classList.remove(containerClass);
                        if (isDisposablePicksElementFlag)
                            containerElement.removeChild(picksDom.picksElement)
                        picksDom.dispose();
                        filterDom.dispose();
                    }
                }
            }
        }
    }
}