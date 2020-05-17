export function JQueryMethodsPlugin(pluginData){
    let {staticDom, staticDialog, staticPicks} = pluginData;
    return {
        afterConstructor(multiSelect){
            multiSelect.GetContainer = ()=> staticDom.containerElement;
            multiSelect.GetChoices = ()=> staticDialog.choicesElement;
            multiSelect.GetFilterInput = ()=> staticPicks.filterInputElement;
            multiSelect.PicksCount = ()=> multiSelect.picks.getCount();
        }
    }
}