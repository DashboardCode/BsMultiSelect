import {composeSync} from '../ToolsJs';

export function DisabledOptionPlugin(pluginData){
    let {configuration, isChoiceSelectableAspect, createWrapAspect,  buildChoiceAspect,
        filterPredicateAspect, wrapsCollection, optionToggleAspect, buildPickAspect } = pluginData;
    
    let {getIsOptionDisabled, options} = configuration;
    if (options) {
        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option) => (option.disabled===undefined) ? false : option.disabled;     
    } else { // selectElement
        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option) => option.disabled;     
    }

    let origСreateWrap = createWrapAspect.createWrap;
    createWrapAspect.createWrap = (option) => {
        let wrap = origСreateWrap(option);
        wrap.isOptionDisabled = getIsOptionDisabled(option); // TODO: remove usage wrap.isOptionDisabled
        wrap.updateDisabled = null; 
        return wrap;
    };

    let origToggle = optionToggleAspect.toggle;
    optionToggleAspect.toggle = (wrap) => {
        let success = false;
        if (wrap.isOptionSelected || !wrap.isOptionDisabled) // dependency on SelectedOptionPlugin
            success = origToggle(wrap);
        return success;
    };

    let origIsSelectable = isChoiceSelectableAspect.isSelectable
    isChoiceSelectableAspect.isSelectable = (wrap) => {
        return  origIsSelectable(wrap) && !wrap.isOptionDisabled ;
    };

    let origFilterPredicate = filterPredicateAspect.filterPredicate;
    filterPredicateAspect.filterPredicate = (wrap, text) => {
        return  origFilterPredicate(wrap, text) && !wrap.isOptionDisabled ;
    };

    let origBuildChoice = buildChoiceAspect.buildChoice;
    buildChoiceAspect.buildChoice = (wrap) => {
        origBuildChoice(wrap);
        wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled
        wrap.choice.dispose = composeSync(()=>{wrap.updateDisabled=null;}, wrap.choice.dispose);
    }

    
    let origBuildPick = buildPickAspect.buildPick;
    buildPickAspect.buildPick = (wrap, removeOnButton) => {
        origBuildPick(wrap, removeOnButton);
        let pick =wrap.pick;
        pick.updateDisabled = () => pick.pickDomManagerHandlers.updateDisabled();
        pick.dispose = composeSync(pick.dispose, ()=>{pick.updateDisabled=null});

        let choiceUpdateDisabledBackup = wrap.updateDisabled;
        wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled); // add pickDisabled
        pick.dispose = composeSync(pick.dispose, 
            ()=>{
                wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled
                wrap.updateDisabled(); // make "true disabled" without it checkbox looks disabled
            }
        )
    }

    return {
        buildApi(api){
            api.updateOptionsDisabled = () => wrapsCollection.forLoop( wrap => updateChoiceDisabled(wrap, getIsOptionDisabled))
            api.updateOptionDisabled = (key) => updateChoiceDisabled(wrapsCollection.get(key), getIsOptionDisabled)
        }
    };
}

function updateChoiceDisabled(wrap, getIsOptionDisabled){
    let newIsDisabled = getIsOptionDisabled(wrap.option);
    if (newIsDisabled != wrap.isOptionDisabled)
    {
        wrap.isOptionDisabled= newIsDisabled;
        wrap.updateDisabled?.(); // some hidden oesn't have element (and need to be updated)
    }
}