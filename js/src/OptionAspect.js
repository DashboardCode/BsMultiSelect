import {Choice} from './Choice'

export function OptionAspect(dataSourceAspect){
    return {
        setOptionSelected(choice, value){
            let success = false;
            var confirmed = dataSourceAspect.setSelected(choice.option, value);
            if (!(confirmed===false)) {
                choice.isOptionSelected = value;
                choice.updateSelected();
                success = true;
            }
            return success;
        },
        createChoice(option){
            let isOptionSelected = dataSourceAspect.getSelected(option);
            let isOptionDisabled = dataSourceAspect.getDisabled(option); 
            return Choice(option, isOptionSelected, isOptionDisabled);
        },
        isSelectable(choice){
            return !choice.isOptionSelected  && !choice.isOptionDisabled;
        }
    }
}

export function OptionToggleAspect(optionAspect){
    return {
        toggleOptionSelected(choice){
            var success = false;
            if (choice.isOptionSelected || !choice.isOptionDisabled)
                success = optionAspect.setOptionSelected(choice, !choice.isOptionSelected);
            return success;
        }
    }
}