export function JQueryMethodsPlugin(pluginData){
    let {staticDom, choicesDom, filterDom, picks} = pluginData;
    return {
        buildApi(api){
            api.getContainer = () => staticDom.containerElement;
            api.getChoices = () => choicesDom.choicesElement;
            api.getFilterInput = () => filterDom.filterInputElement;
            api.getPicks = () => picksDom.picksElement;
            
            api.picksCount = () => picks.getCount();
            //api.staticContent = popupAspect; // depricated, alternative accept to popupAspect.setChoicesVisible
        }
    }
}