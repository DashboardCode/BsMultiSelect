import  {EventBinder} from '../ToolsDom';
import  {addStyling, toggleStyling} from '../ToolsStyling';

export function JQueryMethodsPlugin(pluginData){
    let {staticDom, choicesDom, filterDom, picksList} = pluginData;
    return {
        buildApi(api){
            api.getContainer = () =>  staticDom.containerElement;
            api.getChoices = () => choicesDom.choicesElement;
            api.getChoicesList = () => choicesDom.choicesListElement;
            api.getFilterInput = () => filterDom.filterInputElement;
            api.getPicks = () => picksDom.picksElement;
            
            api.picksCount = () => picksList.getCount();

            pluginData.jQueryMethodsPluginData = {EventBinder, addStyling, toggleStyling}
        }
    }
}