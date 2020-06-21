import {composeSync} from '../ToolsJs';

export function DisabledOptionPlugin(pluginData){
    let {configuration, isChoiceSelectableAspect, createChoiceAspect,  buildChoiceAspect,
        filterPredicateAspect, choicesCollection, optionToggleAspect, buildPickAspect } = pluginData;

    let {getIsOptionDisabled} = configuration;
    if (options) {
        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option) => (option.disabled===undefined) ? false : option.disabled;     
    } else { // selectElement
        if (!getIsOptionDisabled)
            getIsOptionDisabled = (option) => option.disabled;     
    }

    let origСreateChoice = createChoiceAspect.createChoice;
    createChoiceAspect.createChoice = (option) => {
        let choice = origСreateChoice(option);
        choice.isOptionDisabled = getIsOptionDisabled(option); // todo: remove usage choice.isOptionDisabled
        choice.updateDisabled = null; // todo: remove usage choice.updateDisabled
        return choice;
    };

    let origToggle = optionToggleAspect.toggle;
    optionToggleAspect.toggle = (choice) => {
        let success = false;
        if (choice.isOptionSelected || !choice.isOptionDisabled)
            success = origToggle(choice, !choice.isOptionSelected);
        return success;
    };

    let origIsSelectable = isChoiceSelectableAspect.isSelectable
    isChoiceSelectableAspect.isSelectable = (choice) => {
        return  origIsSelectable(choice) && !choice.isOptionDisabled ;
    };

    let origFilterPredicate = filterPredicateAspect.filterPredicate;
    filterPredicateAspect.filterPredicate = (choice, text) => {
        return  origFilterPredicate(choice, text) && !choice.isOptionDisabled ;
    };

    let origBuildChoice = buildChoiceAspect.buildChoice;
    buildChoiceAspect.buildChoice = (choice) => {
        origBuildChoice(choice);
        choice.updateDisabled = choice.choiceDomManagerHandlers.updateDisabled
        choice.dispose = composeSync(()=>{choice.updateDisabled=null;}, choice.dispose);
    }

    
    let origBuildPick = buildPickAspect.buildPick;
    buildPickAspect.buildPick = (choice, handleOnRemoveButton) => {
        let pick = origBuildPick(choice, handleOnRemoveButton);
        pick.updateDisabled = () => pick.pickDomManagerHandlers.updateDisabled();
        pick.dispose = composeSync(pick.dispose, ()=>{pick.updateDisabled=null});

        let choiceUpdateDisabledBackup = choice.updateDisabled;
        choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled); // add pickDisabled
        pick.dispose = composeSync(pick.dispose, 
            ()=>{
                choice.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled
                choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
            }
        )
        return pick;
    }


    return {
        buildApi(api){
            api.updateOptionsDisabled = () => choicesCollection.forLoop( choice => updateChoiceDisabled(choice, getIsOptionDisabled))
            api.updateOptionDisabled = (key) => updateChoiceDisabled(choicesCollection.get(key), getIsOptionDisabled)
        }
    };
}

function updateChoiceDisabled(choice, getIsOptionDisabled){
    let newIsDisabled = getIsOptionDisabled(choice.option);
    if (newIsDisabled != choice.isOptionDisabled)
    {
        choice.isOptionDisabled= newIsDisabled;
        choice.updateDisabled?.(); // some hidden oesn't have element (and need to be updated)
    }
}