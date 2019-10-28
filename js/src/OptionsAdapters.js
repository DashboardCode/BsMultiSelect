import { ExtendIfUndefined } from './Tools';

const defaults = {
    getIsValid(){return false},
    getIsInvalid(){return false},
    label:null
}

function OptionsAdapterJson(container, configuration) {
        ExtendIfUndefined(configuration, defaults);

        return function(ms){
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

function OptionsAdapterElement(selectElement, configuration, $) {
    ExtendIfUndefined(configuration, defaults);
    var $selectElement = $(selectElement);
    return function (ms){
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

export {OptionsAdapterJson, OptionsAdapterElement};
