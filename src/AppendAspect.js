export function AppendAspect(){
    return {
        appendToContainer: (containerElement, picksDom, filterDom, choicesDom, isDisposablePicksElementFlag)=> {
            picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
            picksDom.picksElement.appendChild(picksDom.pickFilterElement); 
            containerElement.appendChild(choicesDom.choicesElement); 
            if (isDisposablePicksElementFlag)
                containerElement.appendChild(picksDom.picksElement)
        }
    }
}