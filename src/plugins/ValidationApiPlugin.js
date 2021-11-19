import {ObservableValue, ObservableLambda, defCall, isBoolean, composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';

const defValueMissingMessage = 'Please select an item in the list'

export function ValidationApiPlugin(defaults){
    defaults.getValueRequired = function(){
        return false;
    }
    defaults.valueMissingMessage = '';
    return {
        buildAspects: (aspects, configuration) => {
            return {
                layout: () => {
                    var {triggerAspect, onChangeAspect, optionsAspect, 
                        staticDom, filterDom, updateDataAspect} = aspects;
                   // TODO: required could be a function
                   let {getIsValueMissing, valueMissingMessage, required, getValueRequired} = configuration;
                   if (!isBoolean(required))
                       required = getValueRequired(); 
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
               
                   aspects.validationApiAspect = ValidationApiAspect(validationApiObservable);
               
                   return {
                       buildApi(api){
                           api.validationApi = ValidityApi(
                               filterDom.filterInputElement, 
                               isValueMissingObservable, 
                               valueMissingMessage,
                               (isValid)=>validationApiObservable.setValue(isValid),
                               triggerAspect.trigger
                           );
                       },
                       dispose(){
                           isValueMissingObservable.detachAll(); 
                           validationApiObservable.detachAll();
                       }
                   }
                },
                layoutInit: (aspects)=> {
                }
            }
        }
    }
}

function ValidationApiAspect(validationApiObservable){
    return {
        validationApiObservable
    }
}

function ValidityApi(visibleElement, isValueMissingObservable, valueMissingMessage, onValid, trigger){
    var customValidationMessage = "";
    var validationMessage = "";
    var validity = null;
    var willValidate = true;
    
    function setMessage(valueMissing, customError){
        validity = Object.freeze({
            valueMissing,
            customError,
            valid: !(valueMissing || customError),
        });
        validationMessage = customError?customValidationMessage:(valueMissing?valueMissingMessage:"")
        visibleElement.setCustomValidity(validationMessage);
        onValid(validity.valid);
    }

    setMessage(isValueMissingObservable.getValue(), false);

    isValueMissingObservable.attach(
        (value) => {
            setMessage(value, validity.customError);
        }
    );
    var checkValidity = () => {
        if (!validity.valid)
            trigger('dashboardcode.multiselect:invalid')
        return validity.valid;
    }
    return {
        validationMessage,
        willValidate,
        validity,
        setCustomValidity(message){
            customValidationMessage = message;
            setMessage(validity.valueMissing, customValidationMessage?true:false);
        },
        checkValidity,
        reportValidity(){
            visibleElement.reportValidity();
            return checkValidity();
        }
    }
}