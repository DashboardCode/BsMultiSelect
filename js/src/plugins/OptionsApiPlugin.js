export function OptionsApiPlugin(pluginData){
    let {buildAndAttachChoiceAspect, manageableResetFilterListAspect, choices, createChoiceAspect, setOptionSelectedAspect,
        optionPropertiesAspect, 
        optionsAspect, multiSelectInlineLayoutAspect} = pluginData;
    return {
        buildApi(api){

            api.setOptionSelected = (key, value) => {
                let choice = choices.get(key);
                setOptionSelectedAspect.setOptionSelected(choice, value);
            }
        
            api.updateOptionSelected = (key) => {
                let choice = choices.get(key); // TODO: generalize index as key
                let newIsSelected = optionPropertiesAspect.getSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        
            api.updateOptionDisabled = (key)=>{
                let choice = choices.get(key); // TODO: generalize index as key 
                let newIsDisabled = optionPropertiesAspect.getDisabled(choice.option);
                if (newIsDisabled != choice.isOptionDisabled)
                {
                    choice.isOptionDisabled= newIsDisabled;
                    choice.updateDisabled();
                }
            }
        
            api.updateOptionAdded = (key) => {  // TODO: generalize index as key 
                let options = optionsAspect.getOptions();
                let option = options[key];
                
                let choice = createChoiceAspect.createChoice(option);
                choices.insert(key, choice);
                let nextChoice = ()=> choices.getNext(key, c => c.choiceElement);

                buildAndAttachChoiceAspect.buildAndAttachChoice(
                        choice,
                        (c,e) => multiSelectInlineLayoutAspect.adoptChoiceElement(c,e),
                        (s) => multiSelectInlineLayoutAspect.handleOnRemoveButton(s),
                        () => nextChoice()?.choiceElement
                    )
            }
        
            api.updateOptionRemoved = (key) => { // TODO: generalize index as key 
                multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st, then reset filter
                manageableResetFilterListAspect.resetFilter();
                
                var choice = choices.remove(key);
                choice.remove?.();
                choice.dispose?.();
            }
        }
    }
}