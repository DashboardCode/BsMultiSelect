export function HiddenOptionPlugin(pluginData){
    let {configuration, optionsAspect, options, createChoiceAspect, isChoiceSelectableAspect,
        choices, buildAndAttachChoiceAspect, countableChoicesListInsertAspect, countableChoicesList
    } = pluginData;

    countableChoicesListInsertAspect.countableChoicesListInsert = (choice, key) => {
        if ( !choice.isOptionHidden ){
            let choiceNext = choices.getNext(key, c=>!c.isOptionHidden );
            countableChoicesList.add(choice, choiceNext)
        }
    }

    let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;
    buildAndAttachChoiceAspect.buildAndAttachChoice=(choice, adoptChoiceElement, handleOnRemoveButton, getNextElement) => {
        origBuildAndAttachChoice(choice, adoptChoiceElement, handleOnRemoveButton, getNextElement);
        choice.setVisible(!choice.isOptionHidden)
    }

    var origIsSelectable = isChoiceSelectableAspect.isSelectable;
    isChoiceSelectableAspect.isSelectable = (choice) => origIsSelectable(choice) && !choice.isOptionHidden;
    
    let {getIsOptionHidden} = configuration;
    if (options) {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => (option.hidden===undefined)?false:option.hidden;     
    } else {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => option.hidden;     
    }

    var origСreateChoice = createChoiceAspect.createChoice;
    createChoiceAspect.createChoice = (option) => {
        let choice = origСreateChoice(option);
        choice.isOptionHidden = getIsOptionHidden(option);
        return choice;
    };

    return {
        buildApi(api){
            api.updateOptionsHidden = () => updateOptionsHidden(optionsAspect, choices, countableChoicesList, getIsOptionHidden);
            api.updateOptionHidden = (key) => updateOptionHidden(key, choices, countableChoicesList, getIsOptionHidden);
        }
    }
}

function updateOptionsHidden(optionsAspect, choices, countableChoicesList, getIsOptionHidden){
    let options = optionsAspect.getOptions();
    for(let i = 0; i<options.length; i++){
        updateOptionHidden(i, choices, countableChoicesList, getIsOptionHidden)
    }
}

function updateOptionHidden(key, choices, countableChoicesList, getIsOptionHidden){
    let choice = choices.get(key);
    let getNextNonHidden = () => choices.getNext(key, c => !c.isOptionHidden );
    updateHiddenChoice(choice, getNextNonHidden, countableChoicesList, getIsOptionHidden)
}

function updateHiddenChoice(choice, getNextNonHidden, countableChoicesList, getIsOptionHidden){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice, getNextNonHidden,  countableChoicesList)
    }
}

function updateHidden(choice, getNextNonHidden, countableChoicesList) {
    if (choice.isOptionHidden)
        countableChoicesList.remove(choice)
    else{
        let nextChoice = getNextNonHidden(); // TODO: should not rely on element but do
        countableChoicesList.add(choice, nextChoice); 
    }
    choice.setVisible(!choice.isOptionHidden)
}
