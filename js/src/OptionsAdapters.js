function OptionsAdapterJson(container, options, getDisabled, getIsValid, getIsInvalid, trigger) {
    return {
        container,
        options,
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

function OptionsAdapterElement(selectElement, trigger) {
    selectElement.style.display='none';
    var container = document.createElement('div');
    var options = selectElement.getElementsByTagName('OPTION');
    return {
        container,
        options,
        dispose(){
            container.parentNode.removeChild(container);
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
        }
    }
}

export {OptionsAdapterJson, OptionsAdapterElement};
