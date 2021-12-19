export function StaticManagerAspect(staticDom, picksDom, filterDom){
    return {
        appendToContainer(){ 
            picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
            picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
            containerElement.appendChild(choicesDom.choicesElement); 
            if (isDisposablePicksElementFlag)
                containerElement.appendChild(configDom.picksElement);
        },

        dispose(){ 
            containerElement.removeChild(choicesDom.choicesElement); 
            if (removableContainerClass)
                containerElement.classList.remove(containerClass);
            if (isDisposablePicksElementFlag)
                containerElement.removeChild(configDom.picksElement);
            picksDom.dispose();
            filterDom.dispose();
        }


        // -------------------------------

        // appendToContainer(){ 
        //     let {selectElement} = staticDom;
        //     picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
        //     picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
        //     if (isDisposableContainerElementFlag){
        //         selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling) 
        //         containerElement.appendChild(choicesDom.choicesElement)
        //     }else {
        //         selectElement.parentNode.insertBefore(choicesDom.choicesElement, selectElement.nextSibling)
        //     }
        //     if (isDisposablePicksElementFlag)
        //         containerElement.appendChild(picksDom.picksElement)
        // },
        
        // dispose(){ 
        //     let {selectElement} = staticDom;
        //     choicesDom.choicesElement.parentNode.removeChild(choicesDom.choicesElement);
        //     if (isDisposableContainerElementFlag)
        //         selectElement.parentNode.removeChild(containerElement) 
        //     if (isDisposablePicksElementFlag)
        //         containerElement.removeChild(picksDom.picksElement)
        //     picksDom.dispose();
        //     filterDom.dispose();                                        
        // }
    }
}