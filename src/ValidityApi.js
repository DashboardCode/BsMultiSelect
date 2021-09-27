function createValidity(valueMissing, customError){
    return Object.freeze({
        valueMissing,
        customError,
        valid: !(valueMissing || customError),
    });
}

export function ValidityApi(visibleElement, isValueMissingObservable, valueMissingMessage, onValid, trigger){
    var customValidationMessage = "";
    var validationMessage = "";
    var validity = null;
    var willValidate = true;
    
    function setMessage(valueMissing, customError){
        validity = createValidity(valueMissing, customError);
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