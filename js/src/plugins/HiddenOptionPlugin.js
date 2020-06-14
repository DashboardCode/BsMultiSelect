export function HiddenOptionPlugin(pluginData){
    let {configuration, optionsAspect, options, createChoiceAspect, isChoiceSelectableAspect,
        choices, choicesGetNextAspect, choicesEnumerableAspect,  
        buildAndAttachChoiceAspect, buildChoiceAspect,
        filterListAspect, multiSelectInputAspect} = pluginData;

    let {getIsOptionHidden} = configuration;
    if (options) {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => (option.hidden===undefined)?false:option.hidden;     
    } else {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => option.hidden;     
    }

    choicesGetNextAspect.getNext = (c) => getNextNonHidden(c); // used in filter list and inserts (to find "before")

    choicesEnumerableAspect.forEach = (f) => { // used in filter list 
        let choice = choicesGetNextAspect.getHead();
        while(choice){
            if (!choice.isOptionHidden)
                f(choice);
            choice = choicesGetNextAspect.getNext(choice);
        }
    }    
    
    var origInsertFilterFacade = filterListAspect.insertFilterFacade;
    filterListAspect.insertFilterFacade = (choice, choiceNonhiddenBefore) => {
        if ( !choice.isOptionHidden ){
            origInsertFilterFacade(choice, choiceNonhiddenBefore);
        }
    }

    let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;
    buildAndAttachChoiceAspect.buildAndAttachChoice=(choice, adoptChoiceElement, handleOnRemoveButton, before)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origBuildAndAttachChoice(choice, adoptChoiceElement, handleOnRemoveButton, before);
        }
    }

    var origIsSelectable = isChoiceSelectableAspect.isSelectable;
    isChoiceSelectableAspect.isSelectable = (choice) => origIsSelectable(choice) && !choice.isOptionHidden;
    
    var origСreateChoice = createChoiceAspect.createChoice;
    createChoiceAspect.createChoice = (option) => {
        let choice = origСreateChoice(option);
        choice.isOptionHidden = getIsOptionHidden(option);
        //choice.updateHidden = () => updateHidden(choice, filterListAspect, buildChoiceAspect, multiSelectInputAspect);
        return choice;
    };

    return {
        buildApi(api){
            api.updateOptionsHidden = () => updateOptionsHidden(optionsAspect, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect);
            api.updateOptionHidden  = (key) => updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect);
        }
    }
}

function updateHidden(choice, filterListAspect, buildChoiceAspect, multiSelectInputAspect) {
    if (choice.isOptionHidden) {
        filterListAspect.remove(choice);
        choice.remove(); 
        buildHiddenChoice(choice);
    } else {
        let nextChoice = getNextNonHidden(choice);
        filterListAspect.add(choice, nextChoice);
        buildChoiceAspect.buildChoice(choice,
            (c,e)=>multiSelectInputAspect.adoptChoiceElement(c,e),
            (s)=>multiSelectInputAspect.handleOnRemoveButton(s)
            );
        choice.choiceElementAttach(nextChoice?.choiceElement);
    }
}

function buildHiddenChoice(choice){
    choice.updateSelected = () => void 0;
    choice.updateDisabled = () => void 0;
    
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

function updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect){
    let choice = choices.get(key);
    updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect)
}

function updateOptionsHidden(optionsAspect, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect){
    let options = optionsAspect.getOptions();
    for(let i = 0; i<options.length; i++){
        updateOptionHidden(i, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect)
    }
}

function updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice, filterListAspect, buildChoiceAspect, multiSelectInputAspect)
    }
}

function getNextNonHidden(choice) { // TODO get next visible
    let next = choice.itemNext;
    if (!next) {
        return null;
    } else if (next.isChoiceElementAttached) {
        return next;
    }
    return getNextNonHidden(next)
}