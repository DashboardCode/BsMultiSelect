export function HoveredChoiceAspect(){
    let hoveredChoice=null;
    return {
        getHoveredChoice: () => hoveredChoice,
        setHoveredChoice: (choice) => {hoveredChoice = choice},
        resetHoveredChoice() {
            if (hoveredChoice) {
                hoveredChoice.setHoverIn(false)
                hoveredChoice = null;
            }
        }
    }
}

export function NavigateAspect(hoveredChoiceAspect, navigate){
    return {
        hoverIn(choice){
            hoveredChoiceAspect.resetHoveredChoice(); 
            hoveredChoiceAspect.setHoveredChoice(choice);
            choice.setHoverIn(true);
        },
        navigate: (down) => navigate(down, hoveredChoiceAspect.getHoveredChoice()), 
    }
}