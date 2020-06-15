export function BuildAndAttachChoiceAspect(buildChoiceAspect){
    return {
        buildAndAttachChoice(
            choice,
            adoptChoiceElement, // multiSelectInputAspect.adoptChoiceElement
            handleOnRemoveButton, // multiSelectInputAspect.handleOnRemoveButton
            getNextElement 
            ){
                buildChoiceAspect.buildChoice(choice, adoptChoiceElement, handleOnRemoveButton);
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
    createPickAspect
    ) {
    return {
        buildChoice(
                choice,
                adoptChoiceElement, // aspect.adoptChoiceElement
                handleOnRemoveButton // aspect.handleOnRemoveButton
            ){
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
            let choiceHanlders = choiceDomManager.init();
            let pickTools = { updateSelectedTrue: null, updateSelectedFalse: null }
            let updateSelectedTrue = () => { 
                var removePick = createPickAspect.buildPick(choice, handleOnRemoveButton);
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
                choiceHanlders.updateSelected();
                if (choice.isOptionSelected)
                    pickTools.updateSelectedTrue();
                else {
                    pickTools.updateSelectedFalse();
                    pickTools.updateSelectedFalse=null;
                }
                onChangeAspect.onChange();
            }
        
            var unbindChoiceElement = adoptChoiceElement(choice, choiceElement);
        
            choice.isFilteredIn = true;
            
            choice.setHoverIn = (v) => {
                choice.isHoverIn =v ;
                choiceHanlders.updateHoverIn();
            }
        
            choice.setVisible = (v) => {
                choice.isFilteredIn = v;
                setVisible(choice.isFilteredIn)
            }
        
            choice.updateDisabled = choiceHanlders.updateDisabled;
        
            choice.dispose = () => {
                unbindChoiceElement();
                choiceDomManager.dispose();
    
                choice.choiceElement = null;
                choice.choiceElementAttach = null;
                choice.isChoiceElementAttached = false;
                choice.remove = null; 
                
                choice.updateSelected = null;
                choice.updateDisabled = null;
        
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