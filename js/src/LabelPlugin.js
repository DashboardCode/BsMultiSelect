
export function LabelPlugin(pluginData){
    var {staticContent} = pluginData;
    return {
        afterConstructor(){
            let labelElement = staticContent.getLabelElement();
            let backupedForAttribute = null; // state saved between init and dispose
            if (labelElement) {
                backupedForAttribute = labelElement.getAttribute('for');
                var newId = staticContent.createInputId();
                staticContent.filterInputElement.setAttribute('id', newId);
                labelElement.setAttribute('for',newId);
            }
            if (backupedForAttribute)
                return ()=> labelElement.setAttribute('for',backupedForAttribute);
        }
    }
}