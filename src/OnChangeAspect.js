export function OnChangeAspect(staticDom, name) {
    return {
        onChange(){
            staticDom.trigger(name)
        }
    }
}