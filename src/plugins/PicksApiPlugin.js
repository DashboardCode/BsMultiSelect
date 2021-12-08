export function PicksApiPlugin(){
    return {
        plug
    }
}

export function plug(){
    return (aspects) => {
        return {
                buildApi(api){
                    let {picksList, createWrapAspect} = aspects;
                    api.forEachPeak = (f) => 
                        picksList.forEach(wrap=>f(wrap.option));
                    // TODO: getHeadPeak
                    api.getTailPeak = () => picksList.getTail()?.option;
                    api.countPeaks = () => picksList.getCount();
                    api.isEmptyPeaks = () => picksList.isEmpty();

                    api.addPick = (option) => {
                        let wrap = createWrapAspect.createWrap(option);
                        // TODO should be moved to specific plugins
                        wrap.updateDisabled = () => {};
                        wrap.updateHidden = () => {};
                        
                        let pickHandlers = wrap.choice.addPickForChoice();
                }
            }
        }
    }
}