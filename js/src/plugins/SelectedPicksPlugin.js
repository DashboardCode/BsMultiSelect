import {composeSync} from '../ToolsJs';

// there wrap.isOptionSelected and wrap.updateSelected should be moved in and
// 
export function SelectedPicksPlugin(aspects){

    let {configuration, wrapsCollection, 
        createWrapAspect, buildChoiceAspect, removePickAspect,
        resetLayoutAspect, picksList, isChoiceSelectableAspect, optionToggleAspect,
        /*inputAspect, filterDom, filterManagerAspect,*/ createPickHandlersAspect, addPickAspect,  fullMatchAspect, 
        onChangeAspect, filterPredicateAspect
        } = aspects;
    let { options, picks, isOptionPicked, addPicked, removePicked
         /*,getSelected : getIsOptionSelected, setSelected : setIsOptionSelected*/ } = configuration;
    
    // addPick = (option, key) => updateChoiceSelected(wrapsCollection.get(key), getIsOptionSelected)
    // removePick = (key) => updateChoiceSelected(picks.get(key), getIsOptionSelected)

    if (!options) {
        throw 'SelectedPicksPlugin require options configuration';
    }

    if (!isOptionPicked)
        isOptionPicked = (option) => picks.includes(option);
    
    if (!addPicked)
        addPicked = (option, key) => {
            picks.push(option);
        }
    
    if (!removePicked)
        removePicked = (key) => {
            picks.splice(key, 1);
        }

    let origFilterPredicate = filterPredicateAspect.filterPredicate;
    filterPredicateAspect.filterPredicate = (wrap, text) =>
        !wrap.isOptionSelected  &&  origFilterPredicate(wrap, text)

    let  origBuildChoice = buildChoiceAspect.buildChoice;
    buildChoiceAspect.buildChoice= (wrap) => {
        origBuildChoice(wrap);
        wrap.updateSelected = () => {
            wrap.choice.choiceDomManagerHandlers.updateSelected();
            onChangeAspect.onChange();
        }
        wrap.dispose = composeSync( ()=>{wrap.updateSelected = null}, wrap.dispose)
    }

    // TODO: test this instead of wrap.updateSelected
    // function updateSelected(wrap){
    //     if (wrap.pick){
    //         if (wrap.isOptionSelected)
    //             pickHandlers.producePick();
    //         else {
    //             pickHandlers.removeAndDispose();
    //             pickHandlers.removeAndDispose=null;
    //         }
    //     }
    //     wrap.choice.choiceDomManagerHandlers.updateSelected();
    //     onChangeAspect.onChange();
    // }


    function composeUpdateSelected(wrap, booleanValue){
        return () => {
            wrap.isOptionSelected = booleanValue;
            wrap.updateSelected();
        }
    }

    function trySetWrapSelected(option, updateSelected, booleanValue){ //  wrap.option
        let success = false;
        var confirmed = setIsOptionSelected(option, booleanValue);
        if (!(confirmed===false)) {
            updateSelected();
            success = true;
        }
        return success;
    }

    let origCreateWrap = createWrapAspect.createWrap;
    createWrapAspect.createWrap = (option)=>{
        let wrap = origCreateWrap(option);
        wrap.isOptionSelected = isOptionPicked(option);
        wrap.updateSelected = null; // can it be combined ?
        return wrap;
    }
    

    let origToggle = optionToggleAspect.toggle; // TODO: improve design, no replace
    optionToggleAspect.toggle= (wrap) => {
        return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected)
    }
 
    let origFullMatch = fullMatchAspect.fullMatch;
    fullMatchAspect.fullMatch = (wrap) => {
        return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);
    }

    let removePickOrig = removePickAspect.removePick; // TODO: improve design, no replace
    removePickAspect.removePick = (wrap, pick) => { // TODO: try remove pick
        return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);
    }

    
    let origCreatePickHandlers =  createPickHandlersAspect.createPickHandlers;
    createPickHandlersAspect.createPickHandlers = (wrap)=>{
        let pickHandlers = origCreatePickHandlers(wrap);
        wrap.updateSelected = composeSync(
            ()=>{
                if (wrap.isOptionSelected){
                    let pick = pickHandlers.producePick();
                    wrap.pick = pick;
                    pick.dispose = composeSync(pick.dispose, ()=>{wrap.pick=null;});
                }
                else {
                    pickHandlers.removeAndDispose();
                    pickHandlers.removeAndDispose=null;
                }
            },
            wrap.updateSelected
        )

        addPickAspect.addPick(wrap, pickHandlers); 
        return pickHandlers;
    }

    let origAddPick =  addPickAspect.addPick;
    addPickAspect.addPick = (wrap, pickHandlers) => {
        if (wrap.isOptionSelected){
            let pick = origAddPick(wrap, pickHandlers);
            wrap.pick = pick;
            pick.dispose = composeSync(pick.dispose, ()=>{wrap.pick=null;});
            return pick;
        }
    }

    return {
        buildApi(api){
            api.selectAll = () => {
                resetLayoutAspect.resetLayout(); // always hide 1st
                wrapsCollection.forLoop(
                    wrap => {
                        if (isChoiceSelectableAspect.isSelectable(wrap) &&  !wrap.isOptionSelected)
                            trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true)
                    }
                ); 
            }
        
            api.deselectAll = ()=>{
                resetLayoutAspect.resetLayout(); // always hide 1st
                picksList.forEach(pick=>pick.setSelectedFalse())
            }

            api.setOptionSelected = (key, value) => {
                let wrap = wrapsCollection.get(key);
                return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, value), value);
            }

            // used in FormRestoreOnBackwardPlugin
            api.updateOptionsSelected = () => wrapsCollection.forLoop( wrap => updateChoiceSelected(wrap, isOptionPicked))
            api.addPick = (option, key) => updateChoiceSelected(wrapsCollection.get(key), isOptionPicked)
            api.removePick = (key) => updateChoiceSelected(picks.get(key), isOptionPicked)
        }
    }

    function updateChoiceSelected(pick, isOptionPicked){
        let newIsSelected = isOptionPicked(pick.option);
        if (newIsSelected != wrap.isOptionSelected)
        {
            wrap.isOptionSelected = newIsSelected;
            wrap.updateSelected?.(); // some hidden oesn't have element (and need to be updated)
        }
    }
}
