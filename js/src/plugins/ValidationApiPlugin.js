import {ValidityApi} from '../ValidityApi'
import {ObservableValue, ObservableLambda, def, defCall} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';

const defValueMissingMessage = 'Please select an item in the list'

export function ValidationApiPlugin(pluginData){
    var {configuration, staticContent, staticContent} = pluginData;
    let {getIsValueMissing, valueMissingMessage, required} = configuration;
    required = def(required, staticContent.required);
    valueMissingMessage = defCall(valueMissingMessage,
        ()=> getDataGuardedWithPrefix(staticContent.initialElement,"bsmultiselect","value-missing-message"),
        defValueMissingMessage)
    var isValueMissingObservable = ObservableLambda(()=>required && getIsValueMissing());
    var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());

    return {
        afterConstructor(multiSelect){
            if (!getIsValueMissing) {
                getIsValueMissing = () => {
                    let count = 0;
                    let optionsArray = multiSelect.getOptions();
                    for (var i=0; i < optionsArray.length; i++) {
                        if (optionsArray[i].selected) 
                            count++;
                    }
                    return count===0;
                }
            }
        
            staticContent.validationApiObservable = validationApiObservable;

            let origOnChange = multiSelect.onChange;
            multiSelect.onChange = () => { 
                isValueMissingObservable.call();
                origOnChange(); 
            };
        
            var validationApi = ValidityApi(
                staticContent.filterInputElement, 
                isValueMissingObservable, 
                valueMissingMessage,
                (isValid)=>validationApiObservable.setValue(isValid));
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