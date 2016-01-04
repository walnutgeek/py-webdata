var _ = require("lodash");

function WebFile(input){
    var if_array = _.isArray(input);
    var array = if_array ? input : input.split('/');
    var name = array.pop();
    if( name === "" && !if_array ){
        name = array.pop() + '/';
    }else if(if_array){
        name += '/';
    }
    this.name = name;
    this.parent = array.length > 0 ?  new WebFile(array) : null ;
}

WebFile.prototype.if_root=function(){
    return this.parent === null;
};

WebFile.prototype.if_dir=function(){
    var len = this.name.length;
    return len > 0  && this.name[len-1] === '/';
};

WebFile.prototype.path=function(){
    return this.if_root() ? this.name : this.parent.path() + this.name;
};

WebFile.prototype.enumerate=function(input){
    input = input || [];
    input.splice(0,0,this);
    if(this.parent){
        this.parent.enumerate(input);
    }
    return input;
};

module.exports = WebFile;

