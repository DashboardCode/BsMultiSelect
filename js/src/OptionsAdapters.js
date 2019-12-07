function OptionsAdapterJson(container, options, getDisabled, getIsValid, getIsInvalid, trigger) {
    return {
        container,
        getOptions(){return options},
        dispose(){
            while (container.firstChild) container.removeChild(container.firstChild);
        },
        triggerChange(){
            trigger('multiselect:change');
        },
        getDisabled(){
            return getDisabled?getDisabled():false;
        },
        getIsValid(){
            return getIsValid?getIsValid():false;
        },
        getIsInvalid(){
            return getIsInvalid?getIsInvalid():false;
        }
    }
}

function OptionsAdapterElement(selectElement, trigger, form) {
    selectElement.style.display='none';
    var container = document.createElement('div');
    var resetHanlder = null;
    return {
        container,
        getOptions(){return selectElement.getElementsByTagName('OPTION')},
        dispose(){
            container.parentNode.removeChild(container);
            if (form && resetHanlder)
                form.removeEventListener('reset', resetHanlder);
        },
        afterContainerFilled(){
            selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
        },
        triggerChange(){
            trigger('change');
            trigger('multiselect:change');
        },
        getDisabled(){
            return selectElement.disabled;
        },
        getIsValid(){
            return selectElement.classList.contains('is-valid');
        },
        getIsInvalid(){
            return selectElement.classList.contains('is-invalid');
        },
        subscribeToReset(handler){
            resetHanlder = handler;
            if (form)
                form.addEventListener('reset',resetHanlder);
        }
    }
}

export {OptionsAdapterJson, OptionsAdapterElement};
