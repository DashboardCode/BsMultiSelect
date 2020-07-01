import {composeSync} from '../ToolsJs';

// TODO: there should be two new "independent aspects" AddPickAspect and RemovePickAspect 
// plugin should overdrive them : call setOptionSelected and etc
// therefore there should new component API methods
// addOptionPick(key) -> call addPick(pick) which returns removePick() 
// SetOptionSelectedAspect, OptionToggleAspect should be moved there 
// OptionToggleAspect overrided in DisabledOptionPlugin

// wrap.isOptionSelected ,  wrap.updateSelected
export function SelectedOptionPlugin(pluginData){
    let {wrapsCollection, optionPropertiesAspect,
        createWrapAspect, buildChoiceAspect, removePickAspect,
        resetLayoutAspect, picksList, isChoiceSelectableAspect, setOptionSelectedAspect, optionToggleAspect,
        inputAspect, filterDom, filterManagerAspect, wrapPickAspect, addPickAspect, onChangeAspect, choiceClickAspect,
        } = pluginData;
    
    let origCreateWrap = createWrapAspect.createWrap;
    createWrapAspect.createWrap = (option)=>{
        let wrap = origCreateWrap(option);
        wrap.isOptionSelected = optionPropertiesAspect.getSelected(option);
        wrap.updateSelected = null; // can it be combined ?
        return wrap;
    }
    
    

    let origChoiceClick = choiceClickAspect.choiceClick; // TODO: improve design, no replace
    choiceClickAspect.choiceClick= (wrap) => {
        optionToggleAspect.toggle(wrap);
        filterDom.setFocus();
    }

    let removePickOrig = removePickAspect.removePick; // TODO: improve design, no replace
    removePickAspect.removePick = (wrap) => {
        setOptionSelectedAspect.setOptionSelected(wrap, false);
    }

    
    let  origBuildChoice = buildChoiceAspect.buildChoice;
    buildChoiceAspect.buildChoice= (wrap) => {
        origBuildChoice(wrap);
        wrap.updateSelected = () => {
            wrap.choice.choiceDomManagerHandlers.updateSelected();
            onChangeAspect.onChange();
        }
        wrap.dispose = composeSync( ()=>{ wrap.updateSelected = null}, wrap.dispose)
    }
    
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

    let origWrapPick =  wrapPickAspect.wrapPick;
    wrapPickAspect.wrapPick = (wrap)=>{
        let pickTools = origWrapPick(wrap);
        wrap.updateSelected = composeSync(
            ()=>{
                if (wrap.isOptionSelected)
                    pickTools.addPick();
                else {
                    pickTools.removePick();
                    pickTools.removePick=null;
                }
            },
            wrap.updateSelected
        )
        return pickTools;
    }

    let origAddPick =  addPickAspect.addPick;
    addPickAspect.addPick = (wrap, pickTools) => {
        if (wrap.isOptionSelected)
            origAddPick(wrap, pickTools);
    }

    // let origIsSelectable = isChoiceSelectableAspect.isSelectable
    // isChoiceSelectableAspect.isSelectable = (wrap) => {
    //     return origIsSelectable(wrap) &&  !wrap.isOptionSelected
    // }

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
                        if (isChoiceSelectableAspect.isSelectable(wrap) &&  !wrap.isOptionSelected)
                            setOptionSelectedAspect.setOptionSelected(wrap, true)
                    }
                ); 
            }
        
            api.deselectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                picksList.forEach(wrap=>wrap.pick.setSelectedFalse())
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