export function JQueryMethodsPlugin(pluginData){
    var {staticContent} = pluginData;
    return {
        afterConstructor(multiSelect){
            
            multiSelect.GetContainer = ()=> staticContent.containerElement;
            
            multiSelect.GetChoices= ()=> staticContent.choicesElement;
            multiSelect.GetFilterInput= ()=> staticContent.filterInputElement;
            multiSelect.PicksCount= ()=> multiSelect.picks.getCount();
            multiSelect.Dispose= ()=> multiSelect.dispose();
            multiSelect.DeselectAll= ()=> multiSelect.deselectAll();
            multiSelect.SelectAll= ()=> multiSelect.selectAll();
            multiSelect.UpdateOptionsSelected= ()=> multiSelect.updateOptionsSelected();
            multiSelect.UpdateOptionsDisabled= ()=> multiSelect.updateOptionsDisabled();
            multiSelect.UpdateDisabled= ()=> multiSelect.updateDisabled();
            multiSelect.UpdateAppearance= ()=> multiSelect.updateAppearance();
            multiSelect.UpdateData= ()=> multiSelect.updateData();
            multiSelect.Update= ()=> multiSelect.update();
        }
    }
}