export function ChoicesHover(navigate){
    let hoveredChoice=null;
    function resetHoveredChoice() {
        if (hoveredChoice) {
            hoveredChoice.setHoverIn(false)
            hoveredChoice = null;
        }
    }
    return {
        getHoveredChoice: () => hoveredChoice,
        hoverIn(choice){
            resetHoveredChoice(); 
            hoveredChoice = choice;
            hoveredChoice.setHoverIn(true);
        },
        resetHoveredChoice, 
        navigate: (down) => navigate(down, hoveredChoice), 
    }
}