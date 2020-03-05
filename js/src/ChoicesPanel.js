export function ChoicesPanel() 
{
    let hoveredChoice=null;

    function resetHoveredChoice() {
        if (hoveredChoice) {
            hoveredChoice.isHoverIn = false;
            hoveredChoice.updateHoverIn()
            hoveredChoice = null;
        }
    }

    var item = {
        getHoveredChoice: ()=>hoveredChoice,
        hoverIn(choice){
            resetHoveredChoice(); 
            hoveredChoice = choice;
            hoveredChoice.isHoverIn = true;
            hoveredChoice.updateHoverIn()
        },
        resetHoveredChoice,
    }
    return item;
}

