export function OptionsApiPlugin(pluginData){
    let {buildAndAttachChoiceAspect, wraps, wrapsCollection, createWrapAspect, createChoiceBaseAspect,
        optionsAspect, resetLayoutAspect} = pluginData;
    return {
        buildApi(api){

            api.updateOptionAdded = (key) => {  // TODO: generalize index as key 
                let options = optionsAspect.getOptions();
                let option = options[key];
                
                let wrap = createWrapAspect.createWrap(option);
                wrap.choice= createChoiceBaseAspect.createChoiceBase(option);
                wraps.insert(key, wrap);
                let nextChoice = ()=> wrapsCollection.getNext(key, c => c.choice.choiceElement);

                buildAndAttachChoiceAspect.buildAndAttachChoice(
                        wrap,
                        () => nextChoice()?.choice.choiceElement
                    )
            }
        
            api.updateOptionRemoved = (key) => { // TODO: generalize index as key 
                resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter
                
                var wrap = wraps.remove(key);
                wrap.choice.remove?.();
                wrap.dispose?.();
            }
        }
    }
}