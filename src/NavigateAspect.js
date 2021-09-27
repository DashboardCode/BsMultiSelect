export function HoveredChoiceAspect(){
    let hoveredChoice=null;
    return {
        getHoveredChoice: () => hoveredChoice,
        setHoveredChoice: (wrap) => {hoveredChoice = wrap},
        resetHoveredChoice() {
            if (hoveredChoice) {
                hoveredChoice.choice.setHoverIn(false)
                hoveredChoice = null;
            }
        }
    }
}

export function NavigateAspect(hoveredChoiceAspect, navigate){
    return {
        hoverIn(wrap){
            hoveredChoiceAspect.resetHoveredChoice(); 
            hoveredChoiceAspect.setHoveredChoice(wrap);
            wrap.choice.setHoverIn(true);
        },
        navigate: (down) => navigate(down, hoveredChoiceAspect.getHoveredChoice()), 
    }
}