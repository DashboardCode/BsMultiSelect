export function ResetLayoutAspect(resetFilterAspect){
    return {
        resetLayout(){
            resetFilterAspect.resetFilter();
        }
    }
}