export function SelectAllApiPlugin(pluginData){
    let {multiSelectInlineLayoutAspect, choices, picks, isChoiceSelectableAspect, setOptionSelectedAspect, manageableResetFilterListAspect} = pluginData;
    return {
        buildApi(api){
            api.selectAll= ()=>{
                multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st
                choices.forLoop(
                    choice => {
                        if (isChoiceSelectableAspect.isSelectable(choice))
                            setOptionSelectedAspect.setOptionSelected(choice, true)
                    }
                ); 
                manageableResetFilterListAspect.resetFilter();
            }
        
            api.deselectAll= ()=>{
                multiSelectInlineLayoutAspect.hideChoices(); // always hide 1st
                picks.removeAll();
                manageableResetFilterListAspect.resetFilter();
            }
        }
    }
}