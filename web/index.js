require("./style.scss");
require("bootstrap/dist/css/bootstrap.css");
require("bootstrap/dist/css/bootstrap-theme.css");

var _ = require('lodash');

var $ = window.jQuery = window.$ = require("jquery");
require("bootstrap/dist/js/bootstrap");

var WebFile = require('./WebFile');
var wdf = require('wdf');

var current_file;

var templates = {
    path: _.template(require('raw!./templates/path.html')),
    dir: _.template(require('raw!./templates/dir.html')),
    file: _.template(require('raw!./templates/file.html')),
};

window.onpopstate = function(event){
    navigate(event.state.path);
};

function navigate(path, push_history){
    current_file = new WebFile(path);
    var loading = current_file;
    if(push_history){
        window.history.pushState({path: path},current_file.name,current_file.path());
    }
    document.title = current_file.name;
    $('#header').html(templates.path({
        file: current_file
    }));
    var url = '/.raw' + current_file.path() ;
    $.ajax({
        url: url,
        success: function(data){
            if(loading == current_file){
                if( current_file.if_dir() ){
                    $('#main').html( templates.dir({
                        df: wdf.DataFrame.parse_wdf(data),
                        file: current_file,
                    }) );
                }else{
                    $('#main').html( templates.file({
                        content: data,
                        file: current_file,
                    }) );
                }
            }
        }
    });
}

$(function(){
    $(document).on('click','[data-href]',function(e){
        navigate(e.target.getAttribute('data-href'),true);
    });
    navigate(window.location.pathname);
});