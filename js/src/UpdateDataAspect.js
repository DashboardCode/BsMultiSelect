export function UpdateDataAspect(
    choicesDom, wraps, picksList, fillChoicesAspect,resetLayoutAspect
    ){
    return {
        updateData(){
            // close drop down , remove filter
            resetLayoutAspect.resetLayout();
            choicesDom.choicesListElement.innerHTML = ""; // TODO: there should better "optimization"
            wraps.clear();
            picksList.forEach(pick=>pick.dispose());
            picksList.reset();
            fillChoicesAspect.fillChoices();
        }
    }
}
