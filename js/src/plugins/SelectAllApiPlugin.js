export function SelectAllApiPlugin(pluginData){
    let {hideChoicesResetFilterAspect, choices, picks, isChoiceSelectableAspect, setOptionSelectedAspect} = pluginData;
    return {
        buildApi(api){
            api.selectAll= ()=>{
                hideChoicesResetFilterAspect.hideChoicesResetFilter(); // always hide 1st
                choices.forLoop(
                    choice => {
                        if (isChoiceSelectableAspect.isSelectable(choice))
                            setOptionSelectedAspect.setOptionSelected(choice, true)
                    }
                ); 
            }
        
            api.deselectAll= ()=>{
                hideChoicesResetFilterAspect.hideChoicesResetFilter(); // always hide 1st

                picks.removeAll();
                
            }
        }
    }
}