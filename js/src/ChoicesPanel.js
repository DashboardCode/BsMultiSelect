import {EventBinder} from './ToolsDom'

export function ChoicesPanel(
        getEventLoopFlag, 
        getVisibleMultiSelectDataList, 
        onMoveArrow
        ) 
{
    var hoveredChoice=null;
    var mouseOverChoice=null;

    function resetCandidateToHoveredChoice(){
        if (mouseOverChoice){
            mouseOverChoice.resetCandidateToHoveredChoice();
        }
    }

    function resetChoicesHover() {
        if (hoveredChoice) {
            hoveredChoice.isHoverIn = false;
            hoveredChoice.updateHoverIn()
            hoveredChoice = null;
        }
    }

    var hoverIn = function(choice){
        resetChoicesHover(); 
        hoveredChoice = choice;
        hoveredChoice.isHoverIn = true;
        hoveredChoice.updateHoverIn()
    }


    var processCandidateToHovered = function() {
        if (hoveredChoice != mouseOverChoice)
        {
            hoverIn(mouseOverChoice);
        }
        resetCandidateToHoveredChoice();
    }

    function keyDownArrow(down) {
        let visibleChoices = getVisibleMultiSelectDataList();
        let length = visibleChoices.length;
        let iChoice = null;
        if (length > 0) {
            if (down) {
                let i = hoveredChoice===null?0:hoveredChoice.visibleIndex+1;
                while(i<length){
                    iChoice = visibleChoices[i];
                    if (iChoice.visible){
                        break;
                    }
                    i++;
                }
            } else {
                let i = hoveredChoice===null?length-1:hoveredChoice.visibleIndex-1;
                while(i>=0) {
                    iChoice = visibleChoices[i];
                    if (iChoice.visible) {
                        break;
                    }
                    i--;
                }
            }
        }
        
        if (iChoice)
        {
            hoverIn(iChoice);
            onMoveArrow();
        }
    }

    var onChoiceElementMouseoverGeneral = function(choice, choiceElement)
    {
        let eventLoopFlag = getEventLoopFlag();
        if (eventLoopFlag.get())
        {
            resetCandidateToHoveredChoice();

            mouseOverChoice = choice;
            var eventBinder = EventBinder();
            eventBinder.bind(choiceElement, 'mousemove', processCandidateToHovered);
            eventBinder.bind(choiceElement, 'mousedown', processCandidateToHovered);

            mouseOverChoice.resetCandidateToHoveredChoice = ()=>{
                mouseOverChoice.isMouseOver=false;
                eventBinder.unbind();
                mouseOverChoice.resetCandidateToHoveredChoice=null;
                mouseOverChoice = null;
            }
        }
        else
        {
            if (/*hoveredChoice!=choice*/!choice.isHoverIn)
            {
                // NOTE: mouseleave is not enough to guarantee remove hover styles in situations
                // when style was setuped without mouse (keyboard arrows)
                // therefore force reset manually (done inside hoverIn)
                
                hoverIn(choice);
            }                
        }
    }

    function adoptChoiceElement(choice, choiceElement){

        // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
        
        var onChoiceElementMouseover = () => onChoiceElementMouseoverGeneral(
            choice,
            choiceElement
        )
        
        // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work
        var onChoiceElementMouseleave = () => {
            let eventLoopFlag = getEventLoopFlag();
            if (!eventLoopFlag.get()) {
                resetChoicesHover();
            }
        }
        var eventBinder = EventBinder();
        eventBinder.bind(choiceElement, 'mouseover', onChoiceElementMouseover);
        eventBinder.bind(choiceElement, 'mouseleave', onChoiceElementMouseleave);

        return eventBinder.unbind;
    }

    var item = {
        adoptChoiceElement,
        setFirstChoiceHovered: ()=> {
            // NOTE: do not require the resetChoicesHover since we sure that there is no hovered (menu was just opened)
            hoverIn(getVisibleMultiSelectDataList()[0])
        },
        resetChoicesHover,
        resetCandidateToHoveredChoice: resetCandidateToHoveredChoice,
        getHoveredChoice: ()=>hoveredChoice,
        keyDownArrow
    }
    return item;
}

