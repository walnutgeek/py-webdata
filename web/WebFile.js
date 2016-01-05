var _ = require("lodash");
var wdf = require('wdf');

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
    this.content = null ;
    this.mime = null;
}

var templates = {
    wdf: _.template(require('raw!./templates/wdf.html')),
    file: _.template(require('raw!./templates/file.html')),
};

WebFile.prototype.setContent=function(res,status,data){
    var ct_array = (res.getResponseHeader('Content-Type')||'').split(';');
    this.mime = ct_array[0];
    this.content = data;
};

WebFile.renderers = {
    CACHE_WDF: function(file){
        if( file.extension() === 'wdf' || file.mime === 'text/wdf' ){
            file.wdf = wdf.DataFrame.parse_wdf(file.content) ;
        }
    },
    CACHE_CSV: function(file){
        if( file.extension() === 'csv' || file.mime === 'text/csv' ){
            file.wdf = wdf.DataFrame.parse_csv(file.content) ;
        }
    },
    MD: function(file){
        if( file.extension() === 'md' ||  file.mime === 'text/markdown' ){
            return require("marked")(file.content) ;
        }
    },
    HTML: function(file){
        if( file.extension() === 'htm' || file.extension() === 'html' || file.mime === 'text/html' ){
            return file.content ;
        }
    },
    DIR: function(file){
        if( file.wdf && file.if_dir() && file.wdf.columnSet.getColumn('filename') ) {
            file.wdf_format = {
                filename: {
                    attrs: {
                        'data-href': function (file, row, colname) {
                            var v = file.path() + file.wdf.get(row, colname) +
                                (file.wdf.get(row, 'type') !== 'file' ? '/' : '');
                            return v;
                        }
                    }
                },
                size: {
                    attrs: {
                        'class' : 'number',
                    }
                }
            };
        }
    },
    WDF: function(file){
        if( file.wdf ) {
            return templates.wdf({file: file});
        }
    }
};

WebFile.prototype.format_attrs=function(row,col) {
    var s = '';
    if(this.wdf_format && this.wdf_format[col.name] &&
           this.wdf_format[col.name].attrs ){
        var attr_defs = this.wdf_format[col.name].attrs;
        for(var k in attr_defs){
            if(attr_defs.hasOwnProperty(k)){
                s += ' '+k +'="' ;

                if( _.isFunction(attr_defs[k]) ){
                    s+=_.escape(attr_defs[k](this,row,col.name));
                }else{
                    s+=_.escape(attr_defs[k]);
                }
                s += '"';

            }
        }
    }
    return s;
};
WebFile.prototype.format_value=function(row,col) {
    var s ;
    if(this.wdf_format && this.wdf_format[col.name] ){
        var value_defs = this.wdf_format[col.name].value ;
        if( _.isFunction(value_defs) ){
            s = value_defs(this,row,col.name);
        }else if(value_defs !== undefined){
            s = value_defs;
        }else{
            s = this.wdf.get(row,col.name);
        }
    }else{
            s = this.wdf.get(row,col.name);
    }
    return _.escape(s);
};

WebFile.prototype.extension=function(){
    if( this.ext !== undefined ){
        return this.ext;
    }
    for( var i = this.name.length - 1 ; i > 0 ; i-- ){
        if(this.name[i] === '.' ){
            this.ext = this.name.substr(i+1).toLowerCase();
            return this.ext;
        }
    }
    return null;
};

WebFile.prototype.if_loaded=function(){
    return this.content !== null;
};

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

WebFile.prototype.render=function(){
    for(var name in WebFile.renderers){
        if(!WebFile.renderers.hasOwnProperty(name))
            continue;
        var renderer = WebFile.renderers[name];
        var html = renderer(this);
        if( html !== undefined ){
            console.log(name);
            return html;
        }
    }
    return templates.file({
        file: this,
    });
};

module.exports = WebFile;

