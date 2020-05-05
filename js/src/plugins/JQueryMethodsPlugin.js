export function JQueryMethodsPlugin(pluginData){
    var {staticContent} = pluginData;
    return {
        afterConstructor(multiSelect){
            multiSelect.GetContainer = ()=> staticContent.containerElement;
            multiSelect.GetChoices= ()=> staticContent.choicesElement;
            multiSelect.GetFilterInput= ()=> staticContent.filterInputElement;
            
            multiSelect.PicksCount= ()=> multiSelect.picks.getCount();
        }
    }
}