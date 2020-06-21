export function UpdateDataAspect(
    choicesDom, choices, picks, fillChoicesAspect,resetLayoutAspect
    ){
    return {
        updateData(){
            // close drop down , remove filter
            resetLayoutAspect.resetLayout();
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            choices.clear();
            picks.clear();
            fillChoicesAspect.fillChoices();
        }
    }
}