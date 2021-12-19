export function OptionsApiPlugin(){
    return {
        plug
    }
}

export function plug(){
    return (aspects) => {
        return {
                    buildApi(api){
                        let {buildAndAttachChoiceAspect, wraps, wrapsCollection, createWrapAspect, createChoiceBaseAspect,
                            dataWrap, resetLayoutAspect} = aspects;
                            
                        api.updateOptionAdded = (key) => {  // TODO: generalize index as key 
                            let options = dataWrap.getOptions();
                            let option = options[key];

                            let wrap = createWrapAspect.createWrap(option);
                            wrap.choice= createChoiceBaseAspect.createChoiceBase(option);
                            wraps.insert(key, wrap);
                            let nextChoice = ()=> wrapsCollection.getNext(key, c => c.choice.choiceDom.choiceElement);
                        
                            buildAndAttachChoiceAspect.buildAndAttachChoice(
                                wrap,
                                () => nextChoice()?.choice.choiceDom.choiceElement
                            )
                        }
                    
                        api.updateOptionRemoved = (key) => { // TODO: generalize index as key 
                            resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter

                            var wrap = wraps.remove(key);
                            wrap.choice.choiceDomManagerHandlers.detach?.();
                            wrap.dispose?.();
                        }
                    }
                }
    }
}