import {ObservableValue, ObservableLambda, defCall, isBoolean, composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';

const defValueMissingMessage = 'Please select an item in the list'

export function ValidationApiPlugin(defaults){
    preset(defaults);
    return {
        plug
    }
}

export function preset(defaults){defaults.getValueRequired=() => false; defaults.valueMissingMessage='';}

export function plug(configuration){
    let  {required, getValueRequired, getIsValueMissing, valueMissingMessage} = configuration;
    var getValueRequiredAspect = GetValueRequiredAspect(required, getValueRequired);
    return (aspects) => {
        aspects.getValueRequiredAspect = getValueRequiredAspect;
        return {
            plugStaticDom: ()=>{
                var {dataWrap, staticDom} = aspects;

                var valueMissingMessageEx = defCall(valueMissingMessage,
                   ()=> getDataGuardedWithPrefix(staticDom.initialElement,"bsmultiselect","value-missing-message"),
                   defValueMissingMessage)
            
                if (!getIsValueMissing) {
                    getIsValueMissing = () => {
                       let count = 0;
                       let optionsArray = dataWrap.getOptions();
                       for (var i=0; i < optionsArray.length; i++) {
                           if (optionsArray[i].selected) 
                               count++;
                       }
                       return count===0;
                    }
                }

                return {
                    preLayout() {
                    // getValueRequiredAspect redefined on appendToContainer, so this can't be called on prelayout and layout
                    var isValueMissingObservable = ObservableLambda(()=>getValueRequiredAspect.getValueRequired() && getIsValueMissing());
                    var validationApiObservable  = ObservableValue(!isValueMissingObservable.getValue()); 
                    aspects.validationApiAspect = ValidationApiAspect(validationApiObservable); // used in BsAppearancePlugin layout, possible races

                    return {
                        layout: () => {
                            var {onChangeAspect, updateDataAspect} = aspects;
                            // TODO: required could be a function
                            //let {valueMissingMessage} = configuration;

                            onChangeAspect.onChange = composeSync(isValueMissingObservable.call, onChangeAspect.onChange);
                            updateDataAspect.updateData = composeSync(isValueMissingObservable.call, updateDataAspect.updateData); 
                        
                            return {
                                buildApi(api){
                                    var {staticDom, filterDom} = aspects;
                                    api.validationApi = ValidityApi(
                                       filterDom.filterInputElement,  // !!
                                       isValueMissingObservable, 
                                       valueMissingMessageEx,
                                       (isValid)=>validationApiObservable.setValue(isValid),
                                       staticDom.trigger
                                    );
                                }
                            }
                        },
                        dispose(){
                            isValueMissingObservable.detachAll(); 
                            validationApiObservable.detachAll();
                        }
                    }
                    }
                }
            }
        }
    }
}

function GetValueRequiredAspect(required, getValueRequiredCfg){
    return {
        getValueRequired(){
            let value = false;
            if (!isBoolean(required))
                if (getValueRequiredCfg)
                    value = getValueRequiredCfg();
            return value;
        }
    }
}

function ValidationApiAspect(validationApiObservable){
    return {
        getValue(){
            return validationApiObservable.getValue();
        },
        attach(f){
            validationApiObservable.attach(f);
        }
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