export function HiddenOptionPlugin(pluginData){
    let {configuration, createWrapAspect, isChoiceSelectableAspect,
        wrapsCollection, buildChoiceAspect, buildAndAttachChoiceAspect,
        countableChoicesListInsertAspect, countableChoicesList} = pluginData;

    countableChoicesListInsertAspect.countableChoicesListInsert = (wrap, key) => {
        if ( !wrap.isOptionHidden ){
            let choiceNext = wrapsCollection.getNext(key, c=>!c.isOptionHidden );
            countableChoicesList.add(wrap, choiceNext)
        }
    }

    let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;
    buildAndAttachChoiceAspect.buildAndAttachChoice=(wrap, getNextElement)=>{
        if (wrap.isOptionHidden){ 
            buildHiddenChoice(wrap);
        }
        else{ 
            origBuildAndAttachChoice(wrap, getNextElement);
        }
    }

    var origIsSelectable = isChoiceSelectableAspect.isSelectable;
    isChoiceSelectableAspect.isSelectable = (wrap) => origIsSelectable(wrap) && !wrap.isOptionHidden;

    let {getIsOptionHidden, options} = configuration;
    if (options) {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => (option.hidden===undefined)?false:option.hidden;     
    } else {
        if (!getIsOptionHidden)
            getIsOptionHidden = (option) => {
                return option.hidden;     
            } 
    }
    
    var origСreateWrap = createWrapAspect.createWrap;
    createWrapAspect.createWrap = (option) => {
        let wrap = origСreateWrap(option);
        wrap.isOptionHidden = getIsOptionHidden(option);
        return wrap;
    };

    return {
        buildApi(api){     
            let getNextNonHidden =  (key) => wrapsCollection.getNext(key, c => !c.isOptionHidden );

            api.updateOptionsHidden = () => 
                wrapsCollection.forLoop( (wrap, key) => 
                        updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect)
                    );

            api.updateOptionHidden  = (key) => 
                updateChoiceHidden(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect);
            // TODO create updateHidden ? 
            // it is too complex since we need to find the next non hidden, when this depends on key 
            // there should be the backreference "wrap -> index" invited before
            // api.updateOptionHidden  = (key) => wrapsCollection.get(key).updateHidden();
        }
    }
}

function buildHiddenChoice(wrap){
    wrap.updateSelected = () => void 0;
    
    wrap.choice.isChoiceElementAttached = false;
    wrap.choice.choiceElement = null;
    wrap.choice.choiceElementAttach = null;
    wrap.choice.setVisible = null; 
    wrap.choice.setHoverIn = null;
    wrap.choice.remove = null; 
    
    wrap.choice.dispose = () => { 
        wrap.choice.dispose = null;
    };

    wrap.dispose = () => { 
        wrap.choice.dispose();
        wrap.dispose = null;
    };

}

function updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect){
    let newIsOptionHidden = getIsOptionHidden(wrap.option);
    if (newIsOptionHidden != wrap.isOptionHidden)
    {
        wrap.isOptionHidden= newIsOptionHidden;
        if (wrap.isOptionHidden) {

            countableChoicesList.remove(wrap);
            wrap.choice.remove(); 
            buildHiddenChoice(wrap);
        } else {
            let nextChoice = getNextNonHidden(key);
            countableChoicesList.add(wrap, nextChoice);
            buildChoiceAspect.buildChoice(wrap);
            wrap.choice.choiceElementAttach(nextChoice?.choice.choiceElement);
        }
    }
}
