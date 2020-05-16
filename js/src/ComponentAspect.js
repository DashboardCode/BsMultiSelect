export function ComponentAspect(getDisabled, trigger){
    if (!getDisabled)
        getDisabled = () => false;
    return {
        getDisabled,
        onChange(){
            trigger('dashboardcode.multiselect:change')
        }
    }
}