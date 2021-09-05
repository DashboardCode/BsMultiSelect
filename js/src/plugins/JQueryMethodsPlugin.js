export function JQueryMethodsPlugin(aspects){
    let {staticDom, choicesDom, filterDom, picksList, picksDom} = aspects;
    return {
        buildApi(api){
            api.getContainer = () =>  staticDom.containerElement;
            api.getChoices = () => choicesDom.choicesElement;
            api.getChoicesList = () => choicesDom.choicesListElement;
            api.getFilterInput = () => filterDom.filterInputElement;
            api.getPicks = () => picksDom.picksElement;
            api.picksCount = () => picksList.getCount();
        }
    }
}