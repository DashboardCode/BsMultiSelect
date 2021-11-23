import {plug as plug2, preset as preset2} from './WarningPlugin';

export function WarningBs4Plugin(defaults){
    preset(defaults);
    return {plug:plug2};
}

export function preset(defaults){
    defaults.css.warning = 'alert-warning bg-warning';
    preset2(defaults);
}
