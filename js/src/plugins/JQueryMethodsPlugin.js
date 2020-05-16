export function JQueryMethodsPlugin(){
    return {
        afterConstructor(multiSelect){
            let {staticDom, staticDialog, staticPicks} = multiSelect.staticContent;
            multiSelect.GetContainer = ()=> staticDom.containerElement;
            multiSelect.GetChoices = ()=> staticDialog.choicesElement;
            multiSelect.GetFilterInput = ()=> staticPicks.filterInputElement;
            
            multiSelect.PicksCount = ()=> multiSelect.picks.getCount();
        }
    }
}