export function SelectAllApiPlugin(pluginData){
    let {resetLayoutAspect, wrapsCollection, picks, isChoiceSelectableAspect, setOptionSelectedAspect} = pluginData;
    return {
        buildApi(api){
            api.selectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                wrapsCollection.forLoop(
                    choice => {
                        if (isChoiceSelectableAspect.isSelectable(choice))
                            setOptionSelectedAspect.setOptionSelected(choice, true)
                    }
                ); 
            }
        
            api.deselectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                picks.removeAll();
            }
        }
    }
}