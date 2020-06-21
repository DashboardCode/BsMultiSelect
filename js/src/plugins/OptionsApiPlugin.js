export function OptionsApiPlugin(pluginData){
    let {buildAndAttachChoiceAspect, choices, choicesCollection, createChoiceAspect, setOptionSelectedAspect,
        optionPropertiesAspect, 
        optionsAspect, resetLayoutAspect} = pluginData;
    return {
        buildApi(api){

            api.setOptionSelected = (key, value) => {
                let choice = choicesCollection.get(key);
                setOptionSelectedAspect.setOptionSelected(choice, value);
            }
        
            api.updateOptionSelected = (key) => {
                let choice = choicesCollection.get(key); // TODO: generalize index as key
                let newIsSelected = optionPropertiesAspect.getSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        
            api.updateOptionAdded = (key) => {  // TODO: generalize index as key 
                let options = optionsAspect.getOptions();
                let option = options[key];
                
                let choice = createChoiceAspect.createChoice(option);
                choices.insert(key, choice);
                let nextChoice = ()=> choicesCollection.getNext(key, c => c.choiceElement);

                buildAndAttachChoiceAspect.buildAndAttachChoice(
                        choice,
                        () => nextChoice()?.choiceElement
                    )
            }
        
            api.updateOptionRemoved = (key) => { // TODO: generalize index as key 
                resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter
                
                var choice = choices.remove(key);
                choice.remove?.();
                choice.dispose?.();
            }
        }
    }
}