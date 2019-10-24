class OptionsAdapterJson {
    constructor(container, configuration) {

        configuration.getIsValid=configuration.hasOwnProperty("getIsValid")?configuration.getIsValid:()=>false;
        configuration.getIsInvalid=configuration.hasOwnProperty("getIsInvalid")?configuration.getIsInvalid:()=>false;

        var idPart = container.id;
        var classPart = configuration.containerClass;
        if (!configuration.createInputId)
            configuration.createInputId=()=>`${classPart}-generated-filter-${idPart}`;
        //if (!configuration.createCheckBoxId)
        //    configuration.createCheckBoxId=(option) =>`${classPart}-${idPart}-generated-checkbox-${option.value.toLowerCase()}-id`;
        configuration.label=configuration.hasOwnProperty("label")?configuration.label:null;
        this.init = (ms) => {
            let {$container, $selectedPanel, $dropDownMenu, $filterInput} = ms.fillContainer(container,
                ()=> {
                    while (container.firstChild) container.removeChild(container.firstChild);
                });
            ms.init($container, $selectedPanel, $dropDownMenu, $filterInput, 
                () => {
                    $container.trigger( "multiselect:change" );
                }, 
                () => configuration.options, 
                configuration.hasOwnProperty("getDisabled")?configuration.getDisabled:()=>true);
        }
    }
}

export default OptionsAdapterJson;
