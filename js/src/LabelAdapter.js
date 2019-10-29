function LabelAdapter(label, createInputId){
    var backupForId = label!=null?label.getAttribute('for'):null;
    return {
        init($filterInput) {
            if (label!=null) {
                var newForId = createInputId();
                $filterInput.attr('id', newForId);
                label.setAttribute('for',newForId);
            }
        },
        dispose(){
            if(backupForId)
                label.setAttribute('for',backupForId);
        }
    }
}

export default LabelAdapter;