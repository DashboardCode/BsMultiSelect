function OptionsAdapterElement(selectElement, getDisabled, getSize, getIsValid, getIsInvalid, trigger, form) {
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
        getSize,
        getIsValid,
        getIsInvalid,
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

function OptionsAdapterJson(options, getDisabled, getSize, getIsValid, getIsInvalid, trigger) {
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
        getSize(){
            return getSize?getSize():null
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