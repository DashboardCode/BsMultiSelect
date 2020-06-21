export function BuildAndAttachChoiceAspect(
    buildChoiceAspect,
    ){
    return {
        buildAndAttachChoice(
            choice,
            getNextElement 
            ){
                buildChoiceAspect.buildChoice(choice);
                choice.choiceElementAttach(getNextElement?.());
        }
    }
}

export function BuildChoiceAspect(
    choicesDom,
    filterDom, 
    choiceDomFactory,
    onChangeAspect, 
    optionToggleAspect
    ) {
    return {
        buildChoice(choice) {
            var {choiceElement, setVisible, attach, detach} = choicesDom.createChoiceElement();
            choice.choiceElement = choiceElement;
            choice.choiceElementAttach = attach;
            choice.isChoiceElementAttached = true;
            let {choiceDomManager} = choiceDomFactory.create(
                choiceElement, 
                choice,
                () => {
                    optionToggleAspect.toggle(choice);
                    filterDom.setFocus();
                });
            let choiceDomManagerHandlers = choiceDomManager.init();
            choice.choiceDomManagerHandlers = choiceDomManagerHandlers;
            
            choice.remove = () => {
                detach();
            };
            
            choice.updateSelected = () => {
                choiceDomManagerHandlers.updateSelected();
                onChangeAspect.onChange();
            }
        
            choice.isFilteredIn = true;
            
            choice.setHoverIn = (v) => {
                choice.isHoverIn =v ;
                choiceDomManagerHandlers.updateHoverIn();
            }
        
            choice.setVisible = (v) => {
                choice.isFilteredIn = v;
                setVisible(choice.isFilteredIn)
            }
             
            choice.dispose = () => {
                choice.choiceDomManagerHandlers = null;
                choiceDomManager.dispose();
    
                choice.choiceElement = null;
                choice.choiceElementAttach = null;
                choice.isChoiceElementAttached = false;
                choice.remove = null; 
                
                choice.updateSelected = null;
        
                // not real data manipulation but internal state
                choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
                choice.setHoverIn = null;
        
                choice.dispose = null;
            }
        }
    }
}