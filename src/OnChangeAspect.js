export function TriggerAspect(element, trigger) {
    return {
        trigger: (eventName) => {
            trigger(element, eventName)
        }
    }
}

export function OnChangeAspect(triggerAspect, name) {
    return {
        onChange(){
            triggerAspect.trigger(name)
        }
    }
}


