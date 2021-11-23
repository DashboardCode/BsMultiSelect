import {plug as plug2, preset as preset2} from './WarningPlugin';

export function WarningBs5Plugin(defaults){
    preset(defaults);
    return {plug:plug2};
}

export function preset(defaults){
    defaults.css.warning = 'alert-warning';
    preset2(defaults);
}
