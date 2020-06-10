export function ChoicesElementAspect(
    choicesDom,
    filterDom, 
    choiceDomFactory,
    onChangeAspect, 
    optionToggleAspect,
    picksAspect
    ) {
    return {
        buildChoiceElement(
                choice,
                adoptChoiceElement, // aspect.adoptChoiceElement
                handleOnRemoveButton // aspect.handleOnRemoveButton
            ){
            var {choiceElement, setVisible, attach, detach} = choicesDom.createChoiceElement();
            choice.choiceElement = choiceElement;
            choice.choiceElementAttach = attach;
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
                var removePick = picksAspect.createPick(choice, handleOnRemoveButton);
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

export function ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect){
    return {
        pushChoiceItem(
            choice,
            adoptChoiceElement, // multiSelectInputAspect.adoptChoiceElement
            handleOnRemoveButton // multiSelectInputAspect.handleOnRemoveButton
            ){
                choicesElementAspect.buildChoiceElement(
                    choice,
                    adoptChoiceElement,
                    handleOnRemoveButton
                    );
                choice.choiceElementAttach();
        },
        insertChoiceItem(
            choice,
            adoptChoiceElement, // aspect.adoptChoiceElement
            handleOnRemoveButton
            ){
                choicesElementAspect.buildChoiceElement(choice, adoptChoiceElement, handleOnRemoveButton);
                let nextChoice = choicesGetNextAspect.getNext(choice);
                choice.choiceElementAttach(nextChoice?.choiceElement);
        }
    }
}


export function ChoicesAspect(document, choiceAspect, optionsAspect, choices, choiceFactoryAspect) { 
    return {
        updateDataImpl(
            adoptChoiceElement, // aspect.adoptChoiceElement
            handleOnRemoveButton
        ){
            var fillChoices = () => {
                let options = optionsAspect.getOptions();
                for(let i = 0; i<options.length; i++) {
                    let option = options[i];
                    let choice = choiceAspect.createChoice(option);
                    choices.push(choice);
                    choiceFactoryAspect.pushChoiceItem(
                        choice,
                        adoptChoiceElement,
                        handleOnRemoveButton
                        );
                } 
            }
    
            // browsers can change select value as part of "autocomplete" (IE11) 
            // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
            // but they never "restore" selected-disabled options.
            // TODO: make the FROM Validation for 'selected-disabled' easy.
            if (document.readyState != 'loading') {
                fillChoices();
            } else {
                var domContentLoadedHandler = function(){
                    fillChoices();
                    document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
                }
                document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
            }
        }
    }
}
