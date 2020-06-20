export function HiddenOptionPlugin(pluginData){
    let {configuration, options, createChoiceAspect, isChoiceSelectableAspect,
        choicesCollection, buildChoiceAspect, buildAndAttachChoiceAspect,
        countableChoicesListInsertAspect, countableChoicesList} = pluginData;

    countableChoicesListInsertAspect.countableChoicesListInsert = (choice, key) => {
        if ( !choice.isOptionHidden ){
            let choiceNext = choicesCollection.getNext(key, c=>!c.isOptionHidden );
            countableChoicesList.add(choice, choiceNext)
        }
    }

    let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;
    buildAndAttachChoiceAspect.buildAndAttachChoice=(choice, getNextElement)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origBuildAndAttachChoice(choice, getNextElement);
        }
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
            let getNextNonHidden =  (key) => choicesCollection.getNext(key, c => !c.isOptionHidden );

            api.updateOptionsHidden = () => 
                choicesCollection.forLoop( (choice, key) => 
                        updateChoiceHidden(choice, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect)
                    );
            api.updateOptionHidden  = (key) => 
                updateChoiceHidden(choicesCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect);
        }
    }
}

function buildHiddenChoice(choice){
    choice.updateSelected = () => void 0;
    
    choice.isChoiceElementAttached = false;
    choice.choiceElement = null;
    choice.choiceElementAttach = null;
    choice.setVisible = null; 
    choice.setHoverIn = null;
    choice.remove = null; 
    
    choice.dispose = () => { 
        choice.dispose = null;
    };
}

function updateChoiceHidden(choice, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        if (choice.isOptionHidden) {
            countableChoicesList.remove(choice);
            choice.remove(); 
            buildHiddenChoice(choice);
        } else {
            let nextChoice = getNextNonHidden(key);
            countableChoicesList.add(choice, nextChoice);
            buildChoiceAspect.buildChoice(choice);
            choice.choiceElementAttach(nextChoice?.choiceElement);
        }
    }
}
