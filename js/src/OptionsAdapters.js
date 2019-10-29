function OptionsAdapterJson(container, options, getDisabled, $) {
    var $container = $(container);
    return {
        container,
        options,
        dispose(){
            while (container.firstChild) container.removeChild(container.firstChild);
        },
        triggerChange(){
            $container.trigger( "multiselect:change" );
        },
        getDisabled(){
            return getDisabled?getDisabled():false;
        }
    }
}

function OptionsAdapterElement(selectElement, $) {
    var $selectElement = $(selectElement);
    selectElement.style.display='none';
    var container = document.createElement("div");
    var options = $selectElement.find('OPTION');;
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
            $selectElement.trigger('change');
            $selectElement.trigger("multiselect:change");
        },
        getDisabled(){
            return selectElement.disabled;
        }
    }
}

export {OptionsAdapterJson, OptionsAdapterElement};
