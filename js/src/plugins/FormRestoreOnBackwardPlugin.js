

export function FormRestoreOnBackwardPlugin(pluginData){
    var {staticDom, window} = pluginData;
    return {
        afterConstructor(multiSelect){
            let origLoad = multiSelect.load.bind(multiSelect);
            multiSelect.load = ()=>{
                origLoad();
                // support browser's "step backward" and form's values restore
                if (staticDom.selectElement && window.document.readyState !="complete"){
                    window.setTimeout(function(){multiSelect.updateOptionsSelected()});
                }
            }
        }
    }
}