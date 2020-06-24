export function UpdateOptionsSelectedApiPlugin(pluginData){
    let {wrapsCollection, optionPropertiesAspect} = pluginData;
    return {
        buildApi(api){
            // used in FormRestoreOnBackwardPlugin
            api.updateOptionsSelected = () => {
                wrapsCollection.forLoop(
                    choice => {
                        let newIsSelected = optionPropertiesAspect.getSelected(choice.option);
                        if (newIsSelected != choice.isOptionSelected)
                        {
                            choice.isOptionSelected = newIsSelected;
                            choice.updateSelected();
                        }
                    }
                );
            }
        }
    }
}