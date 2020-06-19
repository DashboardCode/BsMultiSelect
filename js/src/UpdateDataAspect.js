export function UpdateDataAspect(
    choicesDom, choices, picks, fillChoicesAspect,
    beforeUpdateData
    ){
    return {
        updateData(){
            // close drop down , remove filter
            beforeUpdateData();
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            choices.clear();
            picks.clear();
            fillChoicesAspect.fillChoices();
        }
    }
}