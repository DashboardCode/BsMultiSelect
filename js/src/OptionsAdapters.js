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

/*
<div class="dashboardcode-bsmultiselect">
    <select name="States1" id="edit-states1-id" class="form-control test" multiple="multiple" 
            style="display: none;">
                            <option value="AL">Alabama</option>
                            <option value="AK" disabled="">Alaska</option>
    </select>
    <div class="input-group">
        <div class="input-group-prepend">
            <button class="btn btn-outline-secondary" type="button">Button</button>
            <button class="btn btn-outline-secondary" type="button">Button</button>
        </div>
 
        <ul class="form-control" 
            style="display: flex; flex-wrap: wrap; list-style-type: none; margin-bottom: 
            0px; height: auto; min-height: calc(2.25rem + 2px);">
        </ul>
    </div>
</div>
*/
function OptionsAdapterElement(/* container, */ selectElement, getDisabled, trigger, form) {
    selectElement.style.display='none';
    //if (!container)
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
        getDisabled,
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
