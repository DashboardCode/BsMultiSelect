export function DisabledOptionApiPlugin(pluginData){
    let {choices, dataSourceAspect} = pluginData;

    return Object.create({
        buildApi(api){
            api.updateOptionsDisabled = () => updateOptionsDisabled(choices, dataSourceAspect)
        }
    });
}

function updateOptionsDisabled(choices, dataSourceAspect){
    choices.forLoop(
        choice => {
            let newIsDisabled = dataSourceAspect.getDisabled(choice.option);
            if (newIsDisabled != choice.isOptionDisabled)
            {
                choice.isOptionDisabled= newIsDisabled;
                choice.updateDisabled();
            }
        }
    );
}