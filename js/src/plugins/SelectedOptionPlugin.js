// TODO: there should be two new "independent aspects" AddPickAspect and RemovePickAspect 
// plugin should overdrive them : call setOptionSelected and etc
// therefore there should new component API methods
// addOptionPick(key) -> call addPick(pick) which returns removePick() 
// SetOptionSelectedAspect, OptionToggleAspect should be moved there 
// OptionToggleAspect overrided in DisabledOptionPlugin

export function SelectedOptionPlugin(pluginData){
    let {wrapsCollection, optionPropertiesAspect,
        resetLayoutAspect, picksList, isChoiceSelectableAspect, setOptionSelectedAspect,
        inputAspect, filterDom, filterManagerAspect
        } = pluginData;
    // TODO override buildPick and create .setSelectedFalse
    let origProcessInput = inputAspect.processInput;

    inputAspect.processInput =()=>{
        let origResult = origProcessInput();
        if (!origResult.isEmpty)
        {
            if ( filterManagerAspect.getNavigateManager().getCount() == 1)
            {
                // todo: move exact match to filterManager
                let fullMatchWrap =  filterManagerAspect.getNavigateManager().getHead();
                let text = filterManagerAspect.getFilter();
                if (fullMatchWrap.choice.searchText == text)
                {
                    setOptionSelectedAspect.setOptionSelected(fullMatchWrap, true);
                    filterDom.setEmpty();
                    origResult.isEmpty = true;
                }
            }
        }
        return origResult;
    }

    return {
        buildApi(api){
            // used in FormRestoreOnBackwardPlugin
            api.updateOptionsSelected = () => {
                wrapsCollection.forLoop(
                    wrap => {
                        let newIsSelected = optionPropertiesAspect.getSelected(wrap.option);
                        if (newIsSelected != wrap.isOptionSelected)
                        {
                            wrap.isOptionSelected = newIsSelected;
                            wrap.updateSelected();
                        }
                    }
                );
            }

            api.selectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                wrapsCollection.forLoop(
                    wrap => {
                        if (isChoiceSelectableAspect.isSelectable(wrap))
                            setOptionSelectedAspect.setOptionSelected(wrap, true)
                    }
                ); 
            }
        
            api.deselectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                picksList.forEach(pick=>pick.setSelectedFalse())
            }

            api.setOptionSelected = (key, value) => {
                let wrap = wrapsCollection.get(key);
                setOptionSelectedAspect.setOptionSelected(wrap, value);
            }
        
            api.updateOptionSelected = (key) => {
                let wrap = wrapsCollection.get(key); // TODO: generalize index as key
                let newIsSelected = optionPropertiesAspect.getSelected(wrap.option);
                if (newIsSelected != wrap.isOptionSelected)
                {
                    wrap.isOptionSelected = newIsSelected;
                    wrap.updateSelected();
                }
            }
        }
    }
}