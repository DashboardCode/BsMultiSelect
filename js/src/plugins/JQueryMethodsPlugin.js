export function JQueryMethodsPlugin(pluginData){
    let {staticDom, choicesDom, filterDom} = pluginData;
    return {
        afterConstructor(multiSelect){
            multiSelect.GetContainer = ()=> staticDom.containerElement;
            multiSelect.GetChoices = ()=> choicesDom.choicesElement;
            multiSelect.GetFilterInput = ()=> filterDom.filterInputElement;
            multiSelect.PicksCount = ()=> multiSelect.picks.getCount();
            multiSelect.staticContent = multiSelect.popupAspect; // depricated support
        }
    }
}