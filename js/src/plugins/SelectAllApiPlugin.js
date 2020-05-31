export function SelectAllApiPlugin(pluginData){
    let {multiSelectInputAspect, choices, picks, optionAspect, manageableResetFilterListAspect} = pluginData;
    return {
        afterConstructor(multiSelect){
            multiSelect.selectAll= ()=>{
                multiSelectInputAspect.hideChoices(); // always hide 1st
                choices.forLoop(
                    choice => {
                        if (optionAspect.isSelectable(choice))
                            optionAspect.setOptionSelected(choice, true)
                    }
                ); 
                manageableResetFilterListAspect.resetFilter();
            }
        
            multiSelect.deselectAll= ()=>{
                multiSelectInputAspect.hideChoices(); // always hide 1st
                picks.removeAll();
                manageableResetFilterListAspect.resetFilter();
            }
        }
    }
}