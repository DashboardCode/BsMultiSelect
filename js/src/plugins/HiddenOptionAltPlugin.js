export function HiddenOptionPlugin(pluginData){
    let {configuration, createWrapAspect, isChoiceSelectableAspect,
        wrapsCollection, buildAndAttachChoiceAspect, countableChoicesListInsertAspect, countableChoicesList
    } = pluginData;

    countableChoicesListInsertAspect.countableChoicesListInsert = (wrap, key) => {
        if ( !wrap.isOptionHidden ){
            let choiceNext = wrapsCollection.getNext(key, c=>!c.isOptionHidden );
            countableChoicesList.add(wrap, choiceNext)
        }
    }

    let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;
    buildAndAttachChoiceAspect.buildAndAttachChoice=(wrap,  getNextElement) => {
        origBuildAndAttachChoice(wrap, getNextElement);
        wrap.choice.setVisible(!wrap.isOptionHidden)
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

    var origCreateWrap = createWrapAspect.createWrap;
    createWrapAspect.createWrap = (option) => {
        let wrap = origCreateWrap(option);
        wrap.isOptionHidden = getIsOptionHidden(option);
        return wrap;
    };

    return {
        buildApi(api){
            let getNextNonHidden = (key) => wrapsCollection.getNext(key, c => !c.isOptionHidden );
            api.updateOptionsHidden =  () => 
            wrapsCollection.forLoop( (wrap, key) => 
                    updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden)
                );
            api.updateOptionHidden = (key) => updateChoiceHidden(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden);
        }
    }
}

function updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden){
    let newIsOptionHidden = getIsOptionHidden(wrap.option);
    if (newIsOptionHidden != wrap.isOptionHidden)
    {
        wrap.isOptionHidden= newIsOptionHidden;
        if (wrap.isOptionHidden)
            countableChoicesList.remove(wrap)
        else{
            let nextChoice = getNextNonHidden(key); // TODO: should not rely on element but do
            countableChoicesList.add(wrap, nextChoice); 
        }
        wrap.choice.setVisible(!wrap.isOptionHidden)
    }
}
