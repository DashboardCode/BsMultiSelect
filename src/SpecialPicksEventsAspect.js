export function SpecialPicksEventsAspect(){
    return {
        backSpace(pick){ 
            pick.setSelectedFalse(); 
        }
    }
}