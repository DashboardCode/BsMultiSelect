export function HiddenOptionPlugin(pluginData){
    let {configuration, optionsAspect, options, createChoiceAspect, isChoiceSelectableAspect,
        choices, choicesGetNextAspect, choicesEnumerableAspect,  
        buildAndAttachChoiceAspect, buildChoiceAspect,
        filterListAspect, filteredChoicesList, multiSelectInputAspect,
        onChangeAspect, createPickAspect

        , choicesDom, filterDom, choiceDomFactory, optionToggleAspect
    } = pluginData;

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
            //origBuildAndAttachChoice(choice, adoptChoiceElement, handleOnRemoveButton, before);
            // choice.isChoiceElementAttached = false;
            let p = {choicesDom, filterDom, choiceDomFactory, optionToggleAspect, onChangeAspect, createPickAspect}
            buildHiddenChoice(
                choice,  adoptChoiceElement, (s)=>multiSelectInputAspect.handleOnRemoveButton(s), p
            );
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
        // choice.updateHidden = () => updateHidden(choice, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect, onChangeAspect, createPickAspect);
        return choice;
    };

    return {
        buildApi(api){
            api.updateOptionsHidden = () => updateOptionsHidden(optionsAspect, choices, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect ,onChangeAspect, createPickAspect);
            api.updateOptionHidden = (key) => updateOptionHidden(key, choices, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect ,onChangeAspect, createPickAspect);
        }
    }
}

function updateHidden(choice, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect, onChangeAspect, createPickAspect) {
    if (choice.isOptionHidden)
        filteredChoicesList.remove(choice)
    else{
        let nextChoice = getNextNonHidden(choice);
        filteredChoicesList.add(choice,nextChoice) // next is obligated by I do not know it.
     }
    // not enough. choice.isOptionHidden removes the item from reset loop ()    
    choice.setVisible(!choice.isOptionHidden)
    /*
    if (choice.isOptionHidden) {
        filteredChoicesList.remove(choice);
        choice.remove(); 
        buildHiddenChoice(choice,  (s)=>multiSelectInputAspect.handleOnRemoveButton(s), onChangeAspect, createPickAspect);
    } else {
        let nextChoice = getNextNonHidden(choice);
        filteredChoicesList.add(choice, nextChoice);
        buildChoiceAspect.buildChoice(choice,
            (c,e)=>multiSelectInputAspect.adoptChoiceElement(c,e),
            (s)=>multiSelectInputAspect.handleOnRemoveButton(s)
        );
        choice.choiceElementAttach(nextChoice?.choiceElement);
    }*/
}


function buildHiddenChoice(choice, adoptChoiceElement, handleOnRemoveButton, p){
    let {choicesDom, filterDom, choiceDomFactory, optionToggleAspect, onChangeAspect, createPickAspect} = p;
    var {choiceElement, setVisible, attach, detach} = choicesDom.createChoiceElement();
    choice.choiceElement = choiceElement;
    choice.choiceElementAttach = attach;
    choice.isChoiceElementAttached = true;
    let {choiceDomManager} = choiceDomFactory.create(
         choiceElement, 
         choice,
         () => {
             optionToggleAspect.toggle(choice);
             filterDom.setFocus();
         });
    let choiceHanlders = choiceDomManager.init();
    let pickTools = { updateSelectedTrue: null, updateSelectedFalse: null }
    let updateSelectedTrue = () => { 
        var removePick = createPickAspect.buildPick(choice, handleOnRemoveButton);
        pickTools.updateSelectedFalse = removePick;
    };  

    pickTools.updateSelectedTrue = updateSelectedTrue;  

    choice.remove = () => {
        detach();
        if (pickTools.updateSelectedFalse) {
            pickTools.updateSelectedFalse();
            pickTools.updateSelectedFalse=null;
        }
    };  

    choice.updateSelected = () => {
        choiceHanlders.updateSelected();
        if (choice.isOptionSelected)
            pickTools.updateSelectedTrue();
        else {
            pickTools.updateSelectedFalse();
            pickTools.updateSelectedFalse=null;
        }
        onChangeAspect.onChange();
    }   

    var unbindChoiceElement = adoptChoiceElement(choice, choiceElement);    

    
    choice.isFilteredIn = true; 

    
    choice.setHoverIn = (v) => {
        choice.isHoverIn =v ;
        choiceHanlders.updateHoverIn();
    }   

    choice.setVisible = (v) => {
        choice.isFilteredIn = v;
        setVisible(choice.isFilteredIn)
    }

    choice.updateDisabled =  choiceHanlders.updateDisabled;

    choice.dispose = () => {
        unbindChoiceElement();
        choiceDomManager.dispose(); 

        choice.choiceElement = null;
        choice.choiceElementAttach = null;
        choice.isChoiceElementAttached = false;
        choice.remove = null; 

        choice.updateSelected = null;
        choice.updateDisabled = null;   

        // not real data manipulation but internal state
        choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
        choice.setHoverIn = null;   

        choice.dispose = null;
    }   

    if (choice.isOptionSelected) {
        updateSelectedTrue();
    }
}

function updateOptionHidden(key, choices, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect,
    onChangeAspect, createPickAspect
    ){
    let choice = choices.get(key);
    updateHiddenChoice(choice, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect,
        onChangeAspect, createPickAspect)
}

function updateOptionsHidden(optionsAspect, choices, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect
    ,onChangeAspect, createPickAspect
    ){
    let options = optionsAspect.getOptions();
    for(let i = 0; i<options.length; i++){
        updateOptionHidden(i, choices, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect
            ,onChangeAspect, createPickAspect
            )
    }
}

function updateHiddenChoice(choice, getIsOptionHidden, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect
        , onChangeAspect, createPickAspect
    ){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice, filteredChoicesList, buildChoiceAspect, multiSelectInputAspect
            , onChangeAspect, createPickAspect)
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