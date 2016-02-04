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


var interval = null ;
var frame_path = null ;
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
            frame_path = null;
            interval = setInterval(function(){
                var p ;
                var iframe = document.getElementById("html_frame");
                if(iframe){
                    try{
                        p = iframe.contentWindow.location.pathname;
                    }catch(ignore){}
                    if(p && p !== frame_path){
                        if( p.indexOf('/.raw')===0 ){
                            var header = document.getElementById("header");
                            header.dispatchEvent( new CustomEvent('call_navigate', { detail: {
                                path: p.substring(5),
                                stateAction: 'replace',
                                reload: false
                            }}));
                        }
                    }
                    frame_path = p ;
                }
            },500);
            return '<iframe id="html_frame" src="/.raw'+ file.path() +'" />' ;
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
    if(interval){
        clearInterval(interval);
        interval = null ;
    }
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

