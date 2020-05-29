export function ChoicesElementAspect(
    choicesDom, 
    choiceContentGenerator,
    componentAspect, 
    optionToggleAspect
    ) {
    return {
        createChoiceElement(
            choice,
            setFocus, // filterPanel.setFocus !!
            createPick, // !! this.createPick
            adoptChoiceElement, // aspect.adoptChoiceElement
                    
            ){
            var {choiceElement, setVisible, attach, detach} = choicesDom.createChoiceElement();
            choice.choiceElement = choiceElement;
            choice.choiceElementAttach = attach;
                    
            let choiceContent = choiceContentGenerator(
                choiceElement, 
                () => {
                    optionToggleAspect.toggleOptionSelected(choice);
                    setFocus();
            });
        
            let updateSelectedChoiceContent = () => 
                choiceContent.select(choice.isOptionSelected)
        
            let pickTools = { updateSelectedTrue: null, updateSelectedFalse: null }
            let updateSelectedTrue = () => { 
                var removePick = createPick(choice);
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
                updateSelectedChoiceContent();
                if (choice.isOptionSelected)
                    pickTools.updateSelectedTrue();
                else {
                    pickTools.updateSelectedFalse();
                    pickTools.updateSelectedFalse=null;
                }
                componentAspect.onChange();
            }
        
            var unbindChoiceElement = adoptChoiceElement(choice, choiceElement);
        
            choice.isFilteredIn = true;
        
            choiceContent.setData(choice.option);
            
            choice.setHoverIn = (v) => {
                choice.isHoverIn =v ;
                choiceContent.hoverIn(choice.isHoverIn);
            }
        
            choice.setVisible = (v) => {
                choice.isFilteredIn = v;
                setVisible(choice.isFilteredIn)
            }
        
            choice.updateDisabled = () => {
                choiceContent.disable(choice.isOptionDisabled, choice.isOptionSelected); 
            }
        
            choice.dispose = () => {
                unbindChoiceElement();
                choiceContent.dispose();
    
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
                updateSelectedChoiceContent();
                updateSelectedTrue();
            }
            choice.updateDisabled(); 
        }
    
    }
}

export function ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect){
    return {
        pushChoiceItem(choice,
            setFocus, // filterPanel.setFocus !!
            createPick, // !! this.createPick
            adoptChoiceElement, // aspect.adoptChoiceElement
            ){
                choicesElementAspect.createChoiceElement(
                    choice,
                    setFocus, // filterPanel.setFocus !!
                    createPick, // !! this.createPick
                    adoptChoiceElement // aspect.adoptChoiceElement
                    );
                choice.choiceElementAttach();
        },
        insertChoiceItem(
            choice,
            setFocus, // filterPanel.setFocus !!
            createPick, // !! this.createPick
            adoptChoiceElement // aspect.adoptChoiceElement
            ){
                choicesElementAspect.createChoiceElement(choice, setFocus, createPick, adoptChoiceElement);
                let nextChoice = choicesGetNextAspect.getNext(choice);
                choice.choiceElementAttach(nextChoice?.choiceElement);
        }
    }
}


export function ChoicesAspect(document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect) { 
    return {
        updateDataImpl(
            setFocus, // filterPanel.setFocus !!
            createPick, // !! this.createPick
            adoptChoiceElement // aspect.adoptChoiceElement
        ){
            var fillChoices = () => {
                let options = dataSourceAspect.getOptions();
                for(let i = 0; i<options.length; i++) {
                    let option = options[i];
                    let choice = optionAspect.createChoice(option);
                    choices.push(choice);
                    choiceFactoryAspect.pushChoiceItem(
                        choice,
                        setFocus, // filterPanel.setFocus !!
                        createPick, // !! this.createPick
                        adoptChoiceElement // aspect.adoptChoiceElement
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
