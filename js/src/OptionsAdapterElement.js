class OptionsAdapterElement {
    constructor(selectElement, configuration, $) {
        var $selectElement = $(selectElement);
        
        configuration.getIsValid=()=>$selectElement.hasClass("is-valid");
        configuration.getIsInvalid=()=>$selectElement.hasClass("is-invalid");
        configuration.createInputId=(configuration)=>`${configuration.containerClass}-generated-filter-${selectElement.name.toLowerCase()}-id`;
        configuration.label=null;
        let $formGroup = $selectElement.closest('.form-group');
        if ($formGroup.length == 1) {
            let $label = $formGroup.find(`label[for="${selectElement.id}"]`);
            if ($label.length>0)
            {   
                let label = $label.get(0);
                let forId = label.getAttribute('for');
                if (forId == selectElement.id) {
                    configuration.label = label;
                }
            }   
        }
        configuration.createCheckBoxId=(configuration, option)=>`${configuration.containerClass}-${selectElement.name.toLowerCase()}-generated-checkbox-${option.value.toLowerCase()}-id`;

        this.init = (ms) => {
            selectElement.style.display='none';
            let container = document.createElement("div");
  
            let {$container, $selectedPanel, $dropDownMenu, $filterInput} = ms.fillContainer(container, 
                ()=>container.parentNode.removeChild(container));
            $container.insertAfter(selectElement);
            ms.init($container, $selectedPanel, $dropDownMenu, $filterInput, 
                () => {
                    $selectElement.trigger('change');
                    $selectElement.trigger( "multiselect:change" );
                }, 
                () => $selectElement.find('OPTION'), 
                () => selectElement.disabled);
        }
    }
}

export default OptionsAdapterElement;
