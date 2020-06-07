export function SelectAllApiPlugin(pluginData){
    let {multiSelectInputAspect, choices, picks, choiceAspect, manageableResetFilterListAspect} = pluginData;
    return {
        buildApi(api){
            api.selectAll= ()=>{
                multiSelectInputAspect.hideChoices(); // always hide 1st
                choices.forLoop(
                    choice => {
                        if (choiceAspect.isSelectable(choice))
                            choiceAspect.setOptionSelected(choice, true)
                    }
                ); 
                manageableResetFilterListAspect.resetFilter();
            }
        
            api.deselectAll= ()=>{
                multiSelectInputAspect.hideChoices(); // always hide 1st
                picks.removeAll();
                manageableResetFilterListAspect.resetFilter();
            }
        }
    }
}