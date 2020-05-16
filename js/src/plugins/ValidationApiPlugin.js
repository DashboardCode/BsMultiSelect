import {ValidityApi} from '../ValidityApi'
import {ObservableValue, ObservableLambda, defCall, isBoolean} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';

const defValueMissingMessage = 'Please select an item in the list'

export function ValidationApiPlugin(pluginData){
    var {configuration, staticContent, componentAspect, dataSourceAspect} = pluginData;
    let {getIsValueMissing, valueMissingMessage, required} = configuration;
    if (!isBoolean(required))
        required = staticContent.selectElementPluginData?.required; 
    else if (!isBoolean(required))
        required = false;
    valueMissingMessage = defCall(valueMissingMessage,
        ()=> getDataGuardedWithPrefix(staticContent.staticDom.initialElement,"bsmultiselect","value-missing-message"),
        defValueMissingMessage)

    if (!getIsValueMissing) {
        getIsValueMissing = () => {
            let count = 0;
            let optionsArray = dataSourceAspect.getOptions();
            for (var i=0; i < optionsArray.length; i++) {
                if (optionsArray[i].selected) 
                    count++;
            }
            return count===0;
        }
    }
    
    var isValueMissingObservable = ObservableLambda(()=>required && getIsValueMissing());
    var validationApiObservable  = ObservableValue(!isValueMissingObservable.getValue());

    let origOnChange = componentAspect.onChange;
    componentAspect.onChange = () => { 
        isValueMissingObservable.call();
        origOnChange(); 
    };

    staticContent.validationApiPluginData = {validationApiObservable};

    var validationApi = ValidityApi(
        staticContent.staticPicks.filterInputElement, 
        isValueMissingObservable, 
        valueMissingMessage,
        (isValid)=>validationApiObservable.setValue(isValid));

    return {
        afterConstructor(multiSelect){
            multiSelect.validationApi = validationApi;
        },
        dispose(){
            isValueMissingObservable.detachAll(); 
            validationApiObservable.detachAll();
        }
    }
}

ValidationApiPlugin.setDefaults = (defaults)=>{
    defaults.valueMissingMessage = '';
}