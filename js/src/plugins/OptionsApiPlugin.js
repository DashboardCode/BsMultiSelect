export function OptionsApiPlugin(pluginData){
    let {choiceFactoryAspect, manageableResetFilterListAspect} = pluginData;
    return {
        afterConstructor(multiSelect){

            multiSelect.SetOptionSelected = (key, value) => {
                let choice = multiSelect.choices.get(key);
                multiSelect.optionAspect.setOptionSelected(choice, value);
            }
        
            multiSelect.UpdateOptionSelected = (key) => {
                let choice = multiSelect.choices.get(key); // TODO: generalize index as key
                let newIsSelected = multiSelect.dataSourceAspect.getSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        
            multiSelect.UpdateOptionDisabled = (key)=>{
                let choice = multiSelect.choices.get(key); // TODO: generalize index as key 
                let newIsDisabled = multiSelect.dataSourceAspect.getDisabled(choice.option);
                if (newIsDisabled != choice.isOptionDisabled)
                {
                    choice.isOptionDisabled= newIsDisabled;
                    choice.updateDisabled();
                }
            }
        
            multiSelect.UpdateOptionAdded = (key)=>{  // TODO: generalize index as key 
                let options = multiSelect.dataSourceAspect.getOptions();
                let option = options[key];
                let choice = multiSelect.optionAspect.createChoice(option);
                multiSelect.choices.insert(key, choice);
                choiceFactoryAspect.insertChoiceItem(
                        choice,
                        (c,e) => multiSelect.multiSelectInputAspect.adoptChoiceElement(c,e),
                        (o,s) => multiSelect.multiSelectInputAspect.handleOnRemoveButton(o,s)
                    )
            }
        
            multiSelect.UpdateOptionRemoved = (key)=>{ // TODO: generalize index as key 
                multiSelect.multiSelectInputAspect.hideChoices(); // always hide 1st, then reset filter
                manageableResetFilterListAspect.resetFilter();
                
                var choice = multiSelect.choices.remove(key);
                choice.remove?.();
                choice.dispose?.();
            }
        }
    }
}