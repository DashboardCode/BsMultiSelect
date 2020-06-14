export function HiddenOptionPlugin(pluginData){
    let {configuration, optionsAspect, options, createChoiceAspect, isChoiceSelectableAspect,
        choices, choicesGetNextAspect, choicesEnumerableAspect,  
        buildAndAttachChoiceAspect, buildChoiceAspect,
        filterListAspect, multiSelectInputAspect,
        onChangeAspect, createPickAspect
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
            buildHiddenChoice(choice,  (s)=>multiSelectInputAspect.handleOnRemoveButton(s),
            onChangeAspect, 
            createPickAspect
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
        return choice;
    };

    return {
        buildApi(api){
            api.updateOptionsHidden = () => updateOptionsHidden(optionsAspect, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect ,onChangeAspect, createPickAspect);
            api.updateOptionHidden = (key) => updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect ,onChangeAspect, createPickAspect);
        }
    }
}

function updateHidden(choice, filterListAspect, buildChoiceAspect, multiSelectInputAspect
    ,onChangeAspect, createPickAspect
    ) {
    if (choice.isOptionHidden) {
        filterListAspect.remove(choice);
        choice.remove(); 
        buildHiddenChoice(choice,  (s)=>multiSelectInputAspect.handleOnRemoveButton(s), 
        onChangeAspect, createPickAspect
        );
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

// choiceDomFactory

function buildHiddenChoice(
    choice,
    handleOnRemoveButton, // aspect.handleOnRemoveButton
    //
    onChangeAspect, 
    createPickAspect
){

    //var {choiceElement, setVisible, attach, detach} = choicesDom.createChoiceElement();
    choice.isChoiceElementAttached = false;
    choice.choiceElement = null; //choiceElement;
    choice.choiceElementAttach = null; //attach;
    // let {choiceDomManager} = choiceDomFactory.create(
    //     choiceElement, 
    //     choice,
    //     () => {
    //         optionToggleAspect.toggle(choice);
    //         filterDom.setFocus();
    //     });
    //let choiceHanlders = choiceDomManager.init();
    let pickTools = { updateSelectedTrue: null, updateSelectedFalse: null }
    let updateSelectedTrue = () => { 
        var removePick = createPickAspect.buildPick(choice, handleOnRemoveButton);
        pickTools.updateSelectedFalse = removePick;
    };  

    pickTools.updateSelectedTrue = updateSelectedTrue;  

    choice.remove = () => {
        //detach();
        if (pickTools.updateSelectedFalse) {
            pickTools.updateSelectedFalse();
            pickTools.updateSelectedFalse=null;
        }
    };  

    choice.updateSelected = () => {
        //choiceHanlders.updateSelected();
        if (choice.isOptionSelected)
            pickTools.updateSelectedTrue();
        else {
            pickTools.updateSelectedFalse();
            pickTools.updateSelectedFalse=null;
        }
        onChangeAspect.onChange();
    }   

    //var unbindChoiceElement = adoptChoiceElement(choice, choiceElement);    

    /*
    choice.isFilteredIn = true; 

    
    choice.setHoverIn = (v) => {
        choice.isHoverIn =v ;
        choiceHanlders.updateHoverIn();
    }   

    choice.setVisible = (v) => {
        choice.isFilteredIn = v;
        setVisible(choice.isFilteredIn)
    }*/

    choice.updateDisabled = ()=>{};  

    choice.dispose = () => {
        //unbindChoiceElement();
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

/*
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
}*/

function updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect,
    onChangeAspect, createPickAspect
    ){
    let choice = choices.get(key);
    updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect,
        onChangeAspect, createPickAspect)
}

function updateOptionsHidden(optionsAspect, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect
    ,onChangeAspect, createPickAspect
    ){
    let options = optionsAspect.getOptions();
    for(let i = 0; i<options.length; i++){
        updateOptionHidden(i, choices, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect
            ,onChangeAspect, createPickAspect
            )
    }
}

function updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, buildChoiceAspect, multiSelectInputAspect
        , onChangeAspect, createPickAspect
    ){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice, filterListAspect, buildChoiceAspect, multiSelectInputAspect
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