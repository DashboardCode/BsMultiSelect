

export function FormRestoreOnBackwardPlugin(pluginData){
    var {staticContent, window} = pluginData;
    return {
        afterConstructor(multiSelect){
            let origLoad = multiSelect.load.bind(multiSelect);
            multiSelect.load = ()=>{
                origLoad();
                // support browser's "step backward" and form's values restore
                if (staticContent.selectElement && window.document.readyState !="complete"){
                    window.setTimeout(function(){multiSelect.updateOptionsSelected()});
                }
            }
        }
    }
}