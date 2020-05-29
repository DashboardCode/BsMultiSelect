export function OptionsApiPlugin(pluginData){
    let {choiceFactoryAspect} = pluginData;
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
                choiceFactoryAspect.insertChoiceItem(choice,
                        () => multiSelect.filterPanel.setFocus(),
                        (c) => multiSelect.createPick(c),
                        (c,e) => multiSelect.aspect.adoptChoiceElement(c,e)
                    )
            }
        
            multiSelect.UpdateOptionRemoved = (key)=>{ // TODO: generalize index as key 
                multiSelect.aspect.hideChoices(); // always hide 1st, then reset filter
                multiSelect.resetFilter();
                
                var choice = multiSelect.choices.remove(key);
                choice.remove?.();
                choice.dispose?.();
            }
        }
    }
}