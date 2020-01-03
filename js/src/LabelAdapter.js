export function LabelAdapter(labelElement, createInputId){
    var backupedForAttribute = null; // state saved between init and dispose
    return {
        init(filterInputElement) {
            if (labelElement) {
                backupedForAttribute = labelElement.getAttribute('for');
                var newId = createInputId();
                filterInputElement.setAttribute('id', newId);
                labelElement.setAttribute('for',newId);
            }
        },
        dispose(){
            if(backupedForAttribute)
                labelElement.setAttribute('for',backupedForAttribute);
        }
    }
}