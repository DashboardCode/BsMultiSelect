import  { ExtendIfUndefined } from './Tools';

const defaults = {
    label=null
};

function LabelAdapter(configuration){
    ExtendIfUndefined(configuration, defaults);
    var bs4LabelDispose=null;
    return {
        Init($filterInput){
            var label = configuration.label;
            if (label!=null) {
                var newForId = this.configuration.createInputId();
                var backupForId =  label.getAttribute('for');
                $filterInput.attr('id', newForId);
                label.setAttribute('for',newForId);
                return () => {
                    label.setAttribute('for',backupForId);
                }
            }
            return null;
        },
    
        Dispose(){
            if (bs4LabelDispose)
                bs4LabelDispose();
        }
    }
}

export default LabelAdapter;