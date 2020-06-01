export function HiddenOptionPlugin(pluginData){
    let {configuration, dataSourceAspect, options, optionAspect, 
        choices, choicesGetNextAspect, choicesEnumerableAspect,  
        choiceFactoryAspect, choicesElementAspect,
        filterListAspect, multiSelectInputAspect} = pluginData;

    let {getIsOptionHidden} = configuration;
    if (options) {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => (option.hidden===undefined)?false:option.hidden;     
    } else {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => option.hidden;     
    }

    choicesGetNextAspect.getNext = (c) => getNextNonHidden(c);

    choicesEnumerableAspect.forEach = (f) => {
        let choice = choicesGetNextAspect.getHead();
        while(choice){
            if (!choice.isOptionHidden)
                f(choice);
            choice = choicesGetNextAspect.getNext(choice);
        }
    }    

    var origAddFilterFacade = filterListAspect.addFilterFacade;
    filterListAspect.addFilterFacade = (choice) => {
        if ( !choice.isOptionHidden ) {
            origAddFilterFacade(choice);
        }
    }
    
    var origInsertFilterFacade = filterListAspect.insertFilterFacade;
    filterListAspect.insertFilterFacade = (choice) => {
        if ( !choice.isOptionHidden ){
            origInsertFilterFacade(choice);
        }
    }

    let origInsertChoiceItem = choiceFactoryAspect.insertChoiceItem;
    let origPushChoiceItem = choiceFactoryAspect.pushChoiceItem;
        
    
    choiceFactoryAspect.insertChoiceItem=(choice, adoptChoiceElement, handleOnRemoveButton)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origInsertChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
        }
    }
    
    choiceFactoryAspect.pushChoiceItem=(choice, adoptChoiceElement, handleOnRemoveButton)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origPushChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
        }
    }

    var origIsSelectable = optionAspect.isSelectable;
    optionAspect.isSelectable = (choice) => origIsSelectable(choice) && !choice.isOptionHidden;
    
    var origСreateChoice = optionAspect.createChoice;
    optionAspect.createChoice = (option) => {
        let choice = origСreateChoice(option);
        choice.isOptionHidden = getIsOptionHidden(option);
        return choice;
    };

    return {
        buildApi(api){
            api.updateHidden = (c) => updateHidden(c, filterListAspect, choicesElementAspect, multiSelectInputAspect);
            api.updateOptionsHidden = () => updateOptionsHidden(dataSourceAspect, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect);
            api.updateOptionHidden = (key) => updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect);
        }
    }
}

function updateHidden(choice, filterListAspect, choicesElementAspect, multiSelectInputAspect) {
    if (choice.isOptionHidden) {
        filterListAspect.remove(choice);
        choice.remove(); 
        buildHiddenChoice(choice);
    } else {
        let nextChoice = getNextNonHidden(choice);
        filterListAspect.add(choice, nextChoice);
        choicesElementAspect.buildChoiceElement(choice,
            (c,e)=>multiSelectInputAspect.adoptChoiceElement(c,e),
            (o,s)=>multiSelectInputAspect.handleOnRemoveButton(o,s)
            );
        choice.choiceElementAttach(nextChoice?.choiceElement);
    }
}

function buildHiddenChoice(choice){
    choice.updateSelected = () => void 0;
    choice.updateDisabled = () => void 0;
    
    choice.choiceElement = null;
    choice.choiceElementAttach = null;
    choice.setVisible = null; 
    choice.setHoverIn = null;
    choice.remove = null; 
    
    choice.dispose = () => { 
        choice.dispose = null;
    };
}

function updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect){
    let choice = choices.get(key);
    updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect)
}

function updateOptionsHidden(dataSourceAspect, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect){
    let options = dataSourceAspect.getOptions();
    for(let i = 0; i<options.length; i++){
        updateOptionHidden(i, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect)
    }
}

function updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice, filterListAspect, choicesElementAspect, multiSelectInputAspect)
    }
}

function getNextNonHidden(choice) { // TODO get next visible
    let next = choice.itemNext;
    if (!next) {
        return null;
    } else if (next.choiceElement) {
        return next;
    }
    return getNextNonHidden(next)
}