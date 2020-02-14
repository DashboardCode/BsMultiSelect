import {BsMultiSelect as BsMultiSelectBase}  from './BsMultiSelect'

export function BsMultiSelect(element, environment, settings){
    if (environment.trigger)
        environment.trigger= (element, name) => element.dispatchEvent(new environment.window.Event(name))
    return BsMultiSelectBase(element, environment, settings)
}