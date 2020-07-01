export function PicksApiPlugin(pluginData){
    let {picksList, createWrapAspect, wrapPickAspect, addPickAspect} = pluginData;
    return {
        buildApi(api){
            api.forEachPeak = (f) => 
                picksList.forEach(wrap=>f(wrap.option));
            // TODO: getHeadPeak
            api.getTailPeak = () => picksList.getTail()?.option;
            api.countPeaks = () => picksList.getCount();
            api.isEmptyPeaks = () => picksList.isEmpty();
            
            api.addPick = (option) => {
                let wrap = createWrapAspect.createWrap(option);
                // TODO should be moved to specific plugins
                wrap.updateDisabled = ()=>{};
                wrap.updateHidden = ()=>{};
                let pickTools = wrapPickAspect.wrapPick(wrap);
                addPickAspect.addPick(wrap, pickTools);
            }
        }
    }
}