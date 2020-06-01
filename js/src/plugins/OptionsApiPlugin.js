export function OptionsApiPlugin(pluginData){
    let {choiceFactoryAspect, manageableResetFilterListAspect, choices, optionAspect, dataSourceAspect, multiSelectInputAspect} = pluginData;
    return {
        buildApi(api){

            api.setOptionSelected = (key, value) => {
                let choice = choices.get(key);
                optionAspect.setOptionSelected(choice, value);
            }
        
            api.updateOptionSelected = (key) => {
                let choice = choices.get(key); // TODO: generalize index as key
                let newIsSelected = dataSourceAspect.getSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        
            api.updateOptionDisabled = (key)=>{
                let choice = choices.get(key); // TODO: generalize index as key 
                let newIsDisabled = dataSourceAspect.getDisabled(choice.option);
                if (newIsDisabled != choice.isOptionDisabled)
                {
                    choice.isOptionDisabled= newIsDisabled;
                    choice.updateDisabled();
                }
            }
        
            api.updateOptionAdded = (key)=>{  // TODO: generalize index as key 
                let options = dataSourceAspect.getOptions();
                let option = options[key];
                let choice = optionAspect.createChoice(option);
                choices.insert(key, choice);
                choiceFactoryAspect.insertChoiceItem(
                        choice,
                        (c,e) => multiSelectInputAspect.adoptChoiceElement(c,e),
                        (o,s) => multiSelectInputAspect.handleOnRemoveButton(o,s)
                    )
            }
        
            api.updateOptionRemoved = (key)=>{ // TODO: generalize index as key 
                multiSelectInputAspect.hideChoices(); // always hide 1st, then reset filter
                manageableResetFilterListAspect.resetFilter();
                
                var choice = choices.remove(key);
                choice.remove?.();
                choice.dispose?.();
            }
        }
    }
}