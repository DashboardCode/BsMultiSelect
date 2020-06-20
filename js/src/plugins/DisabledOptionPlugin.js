import {composeSync} from '../ToolsJs';

export function DisabledOptionPlugin(pluginData){
    let {configuration, isChoiceSelectableAspect, createChoiceAspect, 
        filterPredicateAspect, choicesCollection, optionToggleAspect, multiSelectInlineLayout } = pluginData;

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

    // let origAdoptChoiceElement = multiSelectInlineLayout.adoptChoiceElement;
    // multiSelectInlineLayout.adoptChoiceElement = (choice) => {
    //     let unbindChoiceElement = origAdoptChoiceElement(choice);
    //     let newUnbindChoiceElement = composeSync(unbindChoiceElement, ()=>{choice.updateDisabled=null;} )
    //     choice.updateDisabled = choice.choiceHandlers.updateDisabled
    //     return newUnbindChoiceElement;
    // };

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