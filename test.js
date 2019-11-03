var assert = require("assert"), os = require('os');

// this works on windows
// npm install mocha -g
// mocha test.js -expose-gc 

class ClassFunc{
    //state;
    //name;
    constructor(state, name){
        this.state=state; this.name=name
    }

    getState(){return this.state;}

    getName(){return this.name;}
    getName2(){return this.name;}
    getName3(){return this.name;}
    getName4(){return this.name;}
    getName5(){return this.name;}
    getName6(){return this.name;}
    getName7(){return this.name;}
}

function PrototypeFunc (state, name){this.state=state; this.name=name}
PrototypeFunc.prototype = {
    getState:function (){return this.state;},
//    setState:function (_state){this.state = _state;},
    getName:function (){return this.name;},
    getName2:function (){return this.name;},
    getName3:function (){return this.name;},
    getName4:function (){return this.name;},
    getName5:function (){return this.name;},
    getName6:function (){return this.name;},
    getName7:function (){return this.name;},
//    setName:function (_name){this.name = _name;}
};

function InstanceFunc (state, name){
    this.state=state;
    this.name=name;
    this.getState = function (){return this.state;}
        //setState:function (_state){this.state = _state;},
    this.getName=function (){return this.name;}
    this.getName2=function (){return this.name;}
    this.getName3=function (){return this.name;}
    this.getName4=function (){return this.name;}
    this.getName5=function (){return this.name;}
    this.getName6=function (){return this.name;}
    this.getName7=function (){return this.name;}
        //setName:function (_name){this.name = _name;}
}

function InstanceFuncCrazy (){
    return {
        setState:function(s){this.state=s;},
        getState:function(){return this.state;},
        getName:function(){return this.name;},
        setName:function(s){this.name=s;},
        getName2:function(){return this.name;},
        getName3:function(){return this.name;},
        getName4:function(){return this.name;},
        getName5:function(){return this.name;},
        getName6:function(){return this.name;},
        getName7:function(){return this.name;}
    }
}

function ClosureFunc (state, name){
    return{
        getState(){return state;},
        //setState(_state){state = _state;},
        getName(){return name;},
        getName2(){return name;},
        getName3(){return name;},
        getName4(){return name;},
        getName5(){return name;},
        getName6(){return name;},
        getName7(){return name;}
        //setName(_name){name = _name;}
    };
}

describe('# TEST OBJECT CREATION: prototype, instance, closure...', function(){
    console.log ();
    var count = 500000, objs = [count];
    var mem;
    
    it ('PrototypeFunc allocate', function (done){
        global.gc();
        console.log ();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){objs[i] = new PrototypeFunc ("state" + i, "name"+i);}
        let diff = Date.now () - ts;
        console.log ("PrototypeFunc Allocation took:%d msec", diff);
        done ();
    });
    it ('PrototypeFunc access', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){
            //objs[i].setState (state + i);
            assert (objs[i].getState () == "state" + i, "States should be equal");
            //objs[i].setName (name + i);
            assert (objs[i].getName () == "name" + i, "Names should be equal");
        }
        let diff = Date.now() - ts;
        global.gc();
        mem = os.freemem();
        console.log ("PrototypeFunc Access took:%d msec", diff);
        console.log ();
        for (let i = 0; i < count; ++i){delete objs[i]}
        global.gc();
        //console.log ("Free Memory:" + mem + "\n");
        done ();
    });
    // -----------------------------------------------------------------------------
    it ('ClassFunc allocate', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){objs[i] = new ClassFunc ("state" + i, "name"+i);}
        let diff = Date.now() - ts;
        console.log ("ClassFunc Allocation took:%d msec", diff);
        done ();
    });
    it ('ClassFunc access', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){
            //objs[i].setState (state + i);
            assert (objs[i].getState () === "state" + i, "States should be equal "+i);
            //objs[i].setName (name + i);
            assert (objs[i].getName () === "name" + i, "Names should be equal "+i);
        }
        let diff = Date.now() - ts;
        global.gc();
        var mem2 = os.freemem();
        console.log ("ClassFunc Access took:%d msec", diff);
        //console.log ("Free Memory:" + mem2 + "\n");
        //console.log ("Mem diff:" + (mem - mem2) / 1024 + "k");
        console.log ("ClassFunc Mem overhead per obj:" + (mem - mem2) / count + 'bytes');
        console.log ();
        for (let i = 0; i < count; ++i){delete objs[i]}
        global.gc();
        done ();
    });
    // -----------------------------------------------------------------------------
    it ('ClosureFunc allocate', function (done){
        global.gc();
        let ts = Date.now ();
        for (i = 0; i < count; ++i){objs[i] = ClosureFunc ("state" + i, "name"+i);}
        let diff = Date.now() - ts;
        console.log ("ClosureFunc Allocation took:%d msec", diff);
        done ();
    });
    it ('ClosureFunc access', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){
            //objs[i].setState (state + i);
            assert (objs[i].getState () === "state" + i, "States should be equal "+i);
            //objs[i].setName (name + i);
            assert (objs[i].getName () === "name" + i, "Names should be equal "+i);
        }
        let diff = Date.now() - ts;
        global.gc();
        var mem2 = os.freemem();
        console.log ("ClosureFunc Access took:%d msec", diff);
        //console.log ("Free Memory:" + mem2 + "\n");
        //console.log ("Mem diff:" + (mem - mem2) / 1024 + "k");
        console.log ("ClosureFunc Mem overhead per obj:" + (mem - mem2) / count + 'bytes');
        console.log ();
        for (let i = 0; i < count; ++i){delete objs[i]}
        global.gc();
        done ();
    });
    // ----------------------------------------------------------------------------
    it ('InstanceFunc allocate', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){objs[i] = new InstanceFunc ("state" + i, "name"+i);}
        let diff = Date.now() - ts;
        console.log ("InstanceFunc Allocation took:%d msec", diff);
        done ();
    });
    it ('InstanceFunc access', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){
            //objs[i].setState (state + i);
            assert (objs[i].getState () == "state" + i, "States should be equal");
            //objs[i].setName (name + i);
            assert (objs[i].getName () == "name" + i, "Names should be equal");
        }
        let diff = Date.now() - ts;
        global.gc();
        var mem2 = os.freemem();
        console.log ("InstanceFunc Access took:%d msec", diff);
        //console.log ("Free Memory:" + mem2 + "\n");
        //console.log ("Mem diff:" + (mem - mem2) / 1024 + "k");
        console.log ("InstanceFunc Mem overhead per obj:" + (mem - mem2) / count + 'bytes');
        console.log ();
        for (let i = 0; i < count; ++i){delete objs[i]}
        global.gc();
        done ();
    });
    // -----------------------------------------------------------------------------
    it ('InstanceFuncCrazy allocate', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){
            objs[i] = InstanceFuncCrazy ();
            objs[i].setState("state"+ i);
            objs[i].setName("name"+ i);
        }
        let diff = Date.now() - ts;
        console.log ("InstanceFuncCrazy Allocation took:%d msec", diff);
        done ();
    });
    it ('InstanceFuncCrazy access', function (done){
        global.gc();
        let ts = Date.now ();
        for (let i = 0; i < count; ++i){
            //objs[i].setState (state + i);
            assert (objs[i].getState () == "state" + i, "States should be equal");
            //objs[i].setName (name + i);
            assert (objs[i].getName () == "name" + i, "Names should be equal");
        }
        let diff = Date.now() - ts;
        global.gc();
        var mem2 = os.freemem();
        console.log ("InstanceFuncCrazy Access took:%d msec", diff);
        //console.log ("Free Memory:" + mem2 + "\n");
        //console.log ("Mem diff:" + (mem - mem2) / 1024 + "k");
        console.log ("InstanceFuncCrazy Mem overhead per obj:" + (mem - mem2) / count + 'bytes');
        console.log ();
        for (let i = 0; i < count; ++i){delete objs[i]}
        global.gc();
        done ();
    });

});