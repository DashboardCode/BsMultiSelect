export function HiddenOptionPlugin(pluginData){
    let {configuration, optionsAspect, options, createChoiceAspect, isChoiceSelectableAspect,
        choices: choicesCollection, buildAndAttachChoiceAspect, countableChoicesListInsertAspect, countableChoicesList
    } = pluginData;

    countableChoicesListInsertAspect.countableChoicesListInsert = (choice, key) => {
        if ( !choice.isOptionHidden ){
            let choiceNext = choicesCollection.getNext(key, c=>!c.isOptionHidden );
            countableChoicesList.add(choice, choiceNext)
        }
    }

    let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;
    buildAndAttachChoiceAspect.buildAndAttachChoice=(choice,  getNextElement) => {
        origBuildAndAttachChoice(choice, getNextElement);
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
            let getNextNonHidden = (key) => choicesCollection.getNext(key, c => !c.isOptionHidden );
            api.updateOptionsHidden =  () => 
                choicesCollection.forLoop( (choice, key) => 
                    updateChoiceHidden(choice, key, getNextNonHidden, countableChoicesList, getIsOptionHidden)
                );
            api.updateOptionHidden = (key) => updateChoiceHidden(choicesCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden);
        }
    }
}

function updateChoiceHidden(choice, key, getNextNonHidden, countableChoicesList, getIsOptionHidden){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        if (choice.isOptionHidden)
            countableChoicesList.remove(choice)
        else{
            let nextChoice = getNextNonHidden(key); // TODO: should not rely on element but do
            countableChoicesList.add(choice, nextChoice); 
        }
        choice.setVisible(!choice.isOptionHidden)
    }
}
