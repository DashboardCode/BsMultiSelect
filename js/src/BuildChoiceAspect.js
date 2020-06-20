
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
    optionToggleAspect,
    buildPick, //createPickAspect.buildPick(choice, handleOnRemoveButton);
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
            let choiceHandlers = choiceDomManager.init();
            choice.choiceHandlers = choiceHandlers;
            let pickTools = { updateSelectedTrue: null, updateSelectedFalse: null }
            
            let updateSelectedTrue = () => { 
                var removePick = buildPick(choice);
                pickTools.updateSelectedFalse = removePick;
            };
        
            pickTools.updateSelectedTrue = updateSelectedTrue;
            
            choice.remove = () => {
                detach();
                if (pickTools.updateSelectedFalse) {
                    pickTools.updateSelectedFalse();
                    pickTools.updateSelectedFalse=null;
                }
            };
            
            choice.updateSelected = () => {
                choiceHandlers.updateSelected();
                if (choice.isOptionSelected)
                    pickTools.updateSelectedTrue();
                else {
                    pickTools.updateSelectedFalse();
                    pickTools.updateSelectedFalse=null;
                }
                onChangeAspect.onChange();
            }
        
            choice.isFilteredIn = true;
            
            choice.setHoverIn = (v) => {
                choice.isHoverIn =v ;
                choiceHandlers.updateHoverIn();
            }
        
            choice.setVisible = (v) => {
                choice.isFilteredIn = v;
                setVisible(choice.isFilteredIn)
            }
            
            // TODO: should be moved to plugin; currently there is an error during buildPick
            choice.updateDisabled = choiceHandlers.updateDisabled
            choice.dispose = () => {
                choice.choiceHandlers = null;
                choice.updateDisabled = null;
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
        
            
            if (choice.isOptionSelected) {
                updateSelectedTrue();
            }
        }
    }
}