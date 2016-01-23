var _ = require("lodash");
var wdf = require('wdf');
var WebFile = wdf.WebPath ;

var templates = {
     file: _.template(require('raw!./templates/file.html')),
};

WebFile.prototype.setContent=function(res,status,data){
    var ct_array = (res.getResponseHeader('Content-Type')||'').split(';');
    this.mime = ct_array[0];
    this.content = data;
};

WebFile.renderers = {
    CACHE_WDF: function(file){
        if( file.dir || file.extension() === 'wdf' || file.mime === 'text/wdf' ){
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
    WDF: function(file){
        if( file.wdf ) {
            new wdf.WdfView({container: "#main", df:  file.wdf});
            return null ;
        }
    }
};


WebFile.prototype.if_loaded=function(){
    return this.content !== null;
};

WebFile.prototype.render=function(){
    for(var name in WebFile.renderers){
        if(!WebFile.renderers.hasOwnProperty(name))
            continue;
        var renderer = WebFile.renderers[name];
        var html = renderer(this);
        if( html !== undefined ){
            return html;
        }
    }
    return templates.file({
        file: this,
    });
};

module.exports = WebFile;

