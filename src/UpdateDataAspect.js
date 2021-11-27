export function UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect){
    return {
        updateData(){
            // close drop down , remove filter
            resetLayoutAspect.resetLayout();
            choicesDom.choicesListElement.innerHTML = ""; // TODO: there should better "optimization"
            wraps.clear();
            picksList.forEach(pick=>pick.dispose());
            picksList.reset();
            optionsLoopAspect.loop();
        }
    }
}

export function UpdateAspect(updateDataAspect){
    return {
        update(){
            updateDataAspect.updateData();
        }
    }
}