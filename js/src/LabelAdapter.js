function LabelAdapter(label, createInputId){
    var backupedFor = null; // state saved between init and dispose
    return {
        init(filterInput) {
            if (label) {
                backupedFor = label.getAttribute('for');
                var newId = createInputId();
                filterInput.setAttribute('id', newId);
                label.setAttribute('for',newId);
            }
        },
        dispose(){
            if(backupedFor)
                label.setAttribute('for',backupedFor);
        }
    }
}

export default LabelAdapter;