import {composeSync} from '../ToolsJs';

// TODO: there should be two new "independent aspects" AddPickAspect and RemovePickAspect 
// plugin should overdrive them : call setWrapSelected and etc
// therefore there should new component API methods
// addOptionPick(key) -> call addPick(pick) which returns removePick() 
// SetOptionSelectedAspect, OptionToggleAspect should be moved there 
// OptionToggleAspect overrided in DisabledOptionPlugin

// wrap.isOptionSelected ,  wrap.updateSelected
export function SelectedOptionPlugin(pluginData){
    let {configuration, wrapsCollection, 
        createWrapAspect, buildChoiceAspect, removePickAspect,
        resetLayoutAspect, picksList, isChoiceSelectableAspect, optionToggleAspect,
        inputAspect, filterDom, filterManagerAspect, createPickHandlersAspect, addPickAspect, 
        onChangeAspect, filterPredicateAspect
        } = pluginData;
    let {getSelected : getIsOptionSelected, setSelected : setIsOptionSelected, options} = configuration;
    
    if (options) {
        if (!setIsOptionSelected){
            setIsOptionSelected = (option, value) => {option.selected = value};
        }
        if (!getIsOptionSelected)
            getIsOptionSelected = (option) => option.selected;     
    } else { // selectElement
        if (!getIsOptionSelected){
            getIsOptionSelected = (option) => option.selected;
        }
        if (!setIsOptionSelected){
            setIsOptionSelected = (option, value) => {option.selected = value};
            // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
            // if (value) option.setAttribute('selected','');
            // else option.removeAttribute('selected');
        }
    }

    function trySetWrapSelected(wrap, booleanValue){
        let success = false;
        var confirmed = setIsOptionSelected(wrap.option, booleanValue);
            if (!(confirmed===false)) {
                wrap.isOptionSelected = booleanValue;
                wrap.updateSelected();
                success = true;
        }
        return success;
    }

    let origCreateWrap = createWrapAspect.createWrap;
    createWrapAspect.createWrap = (option)=>{
        let wrap = origCreateWrap(option);
        wrap.isOptionSelected = getIsOptionSelected(option);
        wrap.updateSelected = null; // can it be combined ?
        return wrap;
    }
    
    let origFilterPredicate = filterPredicateAspect.filterPredicate
    filterPredicateAspect.filterPredicate = (wrap, text) =>
        !wrap.isOptionSelected  &&  origFilterPredicate(wrap, text)

    let origToggle = optionToggleAspect.toggle; // TODO: improve design, no replace
    optionToggleAspect.toggle= (wrap) => {
        return trySetWrapSelected(wrap, !wrap.isOptionSelected)
    }

    // let origChoiceClick = choiceClickAspect.choiceClick; // TODO: improve design, no replace
    // choiceClickAspect.choiceClick= (wrap) => {
    //     optionToggleAspect.toggle(wrap);
    //     filterDom.setFocus();
    // }

    let removePickOrig = removePickAspect.removePick; // TODO: improve design, no replace
    removePickAspect.removePick = (wrap) => { // TODO: try remove pick
        return trySetWrapSelected(wrap, false);
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
                    let success = trySetWrapSelected(fullMatchWrap, true);
                    if (success) {
                        filterDom.setEmpty();
                        origResult.isEmpty = true;
                    }
                }
            }
        }
        return origResult;
    }

    // TODO: test this instead of wrap.updateSelected
    // function updateSelected(wrap){
    //     if (wrap.pick){
    //         if (wrap.isOptionSelected)
    //             pickHandlers.addPick();
    //         else {
    //             pickHandlers.removePick();
    //             pickHandlers.removePick=null;
    //         }
    //     }
    //     wrap.choice.choiceDomManagerHandlers.updateSelected();
    //     onChangeAspect.onChange();
    // }

    let origCreatePickHandlers =  createPickHandlersAspect.createPickHandlers;
    createPickHandlersAspect.createPickHandlers = (wrap)=>{
        let pickHandlers = origCreatePickHandlers(wrap);
        wrap.updateSelected = composeSync(
            ()=>{
                if (wrap.isOptionSelected)
                    pickHandlers.addPick();
                else {
                    pickHandlers.removePick();
                    pickHandlers.removePick=null;
                }
            },
            wrap.updateSelected
        )
        return pickHandlers;
    }

    let origAddPick =  addPickAspect.addPick;
    addPickAspect.addPick = (wrap, pickTools) => {
        if (wrap.isOptionSelected)
            origAddPick(wrap, pickTools);
    }

    return {
        buildApi(api){
            api.selectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                wrapsCollection.forLoop(
                    wrap => {
                        if (isChoiceSelectableAspect.isSelectable(wrap) &&  !wrap.isOptionSelected)
                            trySetWrapSelected(wrap, true)
                    }
                ); 
            }
        
            api.deselectAll= ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                picksList.forEach(wrap=>wrap.pick.setSelectedFalse())
            }

            api.setOptionSelected = (key, value) => {
                let wrap = wrapsCollection.get(key);
                return trySetWrapSelected(wrap, value);
            }

            // used in FormRestoreOnBackwardPlugin
            api.updateOptionsSelected = () => wrapsCollection.forLoop( wrap => updateChoiceSelected(wrap, getIsOptionSelected))
            api.updateOptionSelected = (key) => updateChoiceSelected(wrapsCollection.get(key), getIsOptionSelected)

        }
    }
}

function updateChoiceSelected(wrap, getIsOptionSelected){
    let newIsSelected = getIsOptionSelected(wrap.option);
    if (newIsSelected != wrap.isOptionSelected)
    {
        wrap.isOptionSelected = newIsSelected;
        wrap.updateSelected?.(); // some hidden oesn't have element (and need to be updated)
    }
}