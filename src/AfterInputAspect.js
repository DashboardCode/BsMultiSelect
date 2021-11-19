export function AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect){
    return {
        visible(showChoices, visibleCount){
            let panelIsVisble = choicesVisibilityAspect.isChoicesVisible();
            if (!panelIsVisble) {
                  showChoices(); 
            }
            if (visibleCount == 1) {
                navigateAspect.hoverIn(filterManagerAspect.getNavigateManager().getHead())
            } else {
                if (panelIsVisble)
                    hoveredChoiceAspect.resetHoveredChoice();
            }   
        },
        notVisible(hideChoices){
            if (choicesVisibilityAspect.isChoicesVisible()){
                hideChoices();
            }
        }
    }
}