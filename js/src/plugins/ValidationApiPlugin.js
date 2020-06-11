import {ValidityApi} from '../ValidityApi'
import {ObservableValue, ObservableLambda, defCall, isBoolean, composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';

const defValueMissingMessage = 'Please select an item in the list'

export function ValidationApiPlugin(pluginData){
    var {configuration, triggerAspect, onChangeAspect, optionsAspect, 
        selectElementPluginData, staticDom, filterDom, updateDataAspect} = pluginData;
    // TODO: required could be a function
    let {getIsValueMissing, valueMissingMessage, required} = configuration;
    if (!isBoolean(required))
        required = selectElementPluginData?.required; 
    else if (!isBoolean(required))
        required = false;
    valueMissingMessage = defCall(valueMissingMessage,
        ()=> getDataGuardedWithPrefix(staticDom.initialElement,"bsmultiselect","value-missing-message"),
        defValueMissingMessage)

    if (!getIsValueMissing) {
        getIsValueMissing = () => {
            let count = 0;
            let optionsArray = optionsAspect.getOptions();
            for (var i=0; i < optionsArray.length; i++) {
                if (optionsArray[i].selected) 
                    count++;
            }
            return count===0;
        }
    }
    
    var isValueMissingObservable = ObservableLambda(()=>required && getIsValueMissing());
    var validationApiObservable  = ObservableValue(!isValueMissingObservable.getValue());

    onChangeAspect.onChange = composeSync(isValueMissingObservable.call, onChangeAspect.onChange);
    updateDataAspect.updateData = composeSync(isValueMissingObservable.call, updateDataAspect.updateData);
    pluginData.validationApiPluginData = {validationApiObservable};

    var validationApi = ValidityApi(
        filterDom.filterInputElement, 
        isValueMissingObservable, 
        valueMissingMessage,
        (isValid)=>validationApiObservable.setValue(isValid),
        triggerAspect.trigger
        );

    return {
        buildApi(api){
            api.validationApi = validationApi;
        },
        dispose(){
            isValueMissingObservable.detachAll(); 
            validationApiObservable.detachAll();
        }
    }
}

ValidationApiPlugin.plugDefaultConfig = (defaults)=>{
    defaults.valueMissingMessage = '';
}