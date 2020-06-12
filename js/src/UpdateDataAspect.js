export function UpdateDataAspect(
    multiSelectInputAspect, 
    manageableResetFilterListAspect,
    choicesDom, choices, picks, fillChoicesAspect
    ){
    return {
        updateData(){
            // close drop down , remove filter
            multiSelectInputAspect.hideChoices(); // always hide 1st
            manageableResetFilterListAspect.resetFilter();
    
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            
            choices.clear();
            picks.clear();
    
            fillChoicesAspect.fillChoices(
                (c,e) => multiSelectInputAspect.adoptChoiceElement(c,e),
                (s) => multiSelectInputAspect.handleOnRemoveButton(s)
            );
        }
    }
}