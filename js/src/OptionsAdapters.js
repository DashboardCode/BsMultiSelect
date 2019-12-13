function OptionsAdapterElement(selectElement, getDisabled, trigger, form) {
    var backup;
    return {
        getOptions(){
            return selectElement.getElementsByTagName('OPTION')
        },
        triggerChange(){
            trigger('change')
            trigger('multiselect:change')
        },
        getDisabled,
        getIsValid(){
            return selectElement.classList.contains('is-valid')
        },
        getIsInvalid(){
            return selectElement.classList.contains('is-invalid')
        },
        subscribeToReset(handler){
            backup = handler;
            if (form)
                form.addEventListener('reset', backup)
        },
        dispose(){
            if (form && backup)
                form.removeEventListener('reset', backup)
        }
    }
}

function OptionsAdapterJson(options, getDisabled, getIsValid, getIsInvalid, trigger) {
    return {
        getOptions(){
            return options
        },
        triggerChange(){
            trigger('multiselect:change')
        },
        getDisabled(){
            return getDisabled?getDisabled():false
        },
        getIsValid(){
            return getIsValid?getIsValid():false
        },
        getIsInvalid(){
            return getIsInvalid?getIsInvalid():false
        }
    }
}

export {OptionsAdapterJson, OptionsAdapterElement}