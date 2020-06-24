export function UpdateDataAspect(
    choicesDom, wraps, picks, fillChoicesAspect,resetLayoutAspect
    ){
    return {
        updateData(){
            // close drop down , remove filter
            resetLayoutAspect.resetLayout();
            choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
            wraps.clear();
            picks.clear();
            fillChoicesAspect.fillChoices();
        }
    }
}