import {findDirectChildByTagName, closestByClassName} from './ToolsDom';

export function StaticDomFactory(
    createElementAspect, choicesDomFactory, filterDomFactory, picksDomFactory, initialDom, containerClass){
    return {
        createStaticDom(){
            var element = initialDom.initialElement;
            
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
                    throw new Error('BsMultiSelect: defined on UL but precedentant DIV for container not found; class='+containerClass);
                }
            } 
            else if (element.tagName=="INPUT") {
                throw new Error('BsMultiSelect: INPUT element is not supported');
            }

            let staticDom = {
                containerElement
            };
            
            let isDisposablePicksElementFlag=false;
            if (!picksElement) {
                picksElement = createElementAspect.createElement('UL');
                isDisposablePicksElementFlag = true; 
            }

            let choicesDom = choicesDomFactory.create();
            let picksDom  = picksDomFactory.create(picksElement, isDisposablePicksElementFlag);
            let filterDom = filterDomFactory.create(isDisposablePicksElementFlag);

            let {choicesElement} = choicesDom; 
            return {
                staticDom,

                choicesDom,
                filterDom,
                picksDom,
                
                staticManager: {
                    appendToContainer(){ 
                        picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
                        picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
                        containerElement.appendChild(choicesElement); 
                        if (isDisposablePicksElementFlag)
                            containerElement.appendChild(picksElement)
                    },
                    dispose(){ 
                        containerElement.removeChild(choicesElement); 
                        if (removableContainerClass)
                            containerElement.classList.remove(containerClass);
                        if (isDisposablePicksElementFlag)
                            containerElement.removeChild(picksElement)
                        picksDom.dispose();
                        filterDom.dispose();
                    }
                }
            }
        }
    }
}