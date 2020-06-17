export function UpdateDataAspect(
    multiSelectInlineLayoutAspect, 
    manageableResetFilterListAspect,
    choicesDom, choices, picks, fillChoicesAspect
    ){
    return {
        updateData(){
            // close drop down , remove filter
            multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st
            manageableResetFilterListAspect.resetFilter();
    
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            
            choices.clear();
            picks.clear();
    
            fillChoicesAspect.fillChoices(
                (c,e) => multiSelectInlineLayoutAspect.adoptChoiceElement(c,e),
                (s) => multiSelectInlineLayoutAspect.handleOnRemoveButton(s)
            );
        }
    }
}