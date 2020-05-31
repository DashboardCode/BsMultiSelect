export function JQueryMethodsPlugin(pluginData){
    let {staticDom, choicesDom, filterDom} = pluginData;
    return {
        buildApi(api){
            api.GetContainer = ()=> staticDom.containerElement;
            api.GetChoices = ()=> choicesDom.choicesElement;
            api.GetFilterInput = ()=> filterDom.filterInputElement;
            api.PicksCount = ()=> api.picks.getCount();
            api.staticContent = api.popupAspect; // depricated support
        }
    }
}