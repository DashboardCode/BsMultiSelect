export function UpdateDataAspect(
    choicesDom, choices, picks, fillChoicesAspect,
    before
    ){
    return {
        updateData(){
            // close drop down , remove filter
            before();
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            choices.clear();
            picks.clear();
            fillChoicesAspect.fillChoices();
        }
    }
}