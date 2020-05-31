export function UpdateDataAspect(multiSelectInputAspect, manageableResetFilterListAspect,
    choicesDom, choices, picks, choicesAspect
    ){
    return {
        updateData(){
            // close drop down , remove filter
            multiSelectInputAspect.hideChoices(); // always hide 1st
            manageableResetFilterListAspect.resetFilter();
    
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            
            choices.clear();
            picks.clear();
    
            choicesAspect.updateDataImpl(
                (c,e) => multiSelectInputAspect.adoptChoiceElement(c,e),
                (o,s) => multiSelectInputAspect.handleOnRemoveButton(o,s)
            );
        }
    }
}