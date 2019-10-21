class OptionsAdapterJson {
    constructor(container, configuration) {

        configuration.getIsValid=configuration.hasOwnProperty("getIsValid")?configuration.getIsValid:()=>false;
        configuration.getIsInvalid=configuration.hasOwnProperty("getIsInvalid")?configuration.getIsInvalid:()=>false;
        configuration.createInputId=(configuration)=>`${configuration.containerClass}-generated-filter-${container.id}`;
        configuration.label=configuration.hasOwnProperty("label")?configuration.label:null;
        configuration.createCheckBoxId=(configuration, option) =>`${configuration.containerClass}-${container.id}-generated-checkbox-${option.value.toLowerCase()}-id`;

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
