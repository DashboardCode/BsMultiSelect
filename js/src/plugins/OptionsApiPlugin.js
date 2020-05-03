export function OptionsApiPlugin(){
    return {
        afterConstructor(multiSelect){

            multiSelect.SetOptionSelected = (key, value) => {
                let choice = this.choices.get(key);
                this.setOptionSelected(choice, value);
            }
        
            multiSelect.UpdateOptionSelected = (key) => {
                let choice = multiSelect.choices.get(key); // TODO: generalize index as key
                let newIsSelected = multiSelect.getIsOptionSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        
            multiSelect.UpdateOptionDisabled = (key)=>{
                let choice = multiSelect.choices.get(key); // TODO: generalize index as key 
                let newIsDisabled = multiSelect.getIsOptionDisabled(choice.option);
                if (newIsDisabled != choice.isOptionDisabled)
                {
                    choice.isOptionDisabled= newIsDisabled;
                    choice.updateDisabled();
                }
            }
        
            multiSelect.UpdateOptionAdded = (key)=>{  // TODO: generalize index as key 
                let options = multiSelect.getOptions();
                let option = options[key];
                let choice = multiSelect.createChoice(option);
                multiSelect.choices.insert(key, choice);
                multiSelect.insertChoiceItem(choice)
            }
        
            multiSelect.UpdateOptionRemoved = (key)=>{ // TODO: generalize index as key 
                multiSelect.aspect.hideChoices(); // always hide 1st, then reset filter
                multiSelect.filterFacade.resetFilter();
        
                var choice = multiSelect.choices.remove(key);
                choice.remove?.();
                choice.dispose?.();
            }
        }
    }
}