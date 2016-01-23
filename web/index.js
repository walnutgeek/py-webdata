require("bootstrap/dist/css/bootstrap.css");
require("bootstrap/dist/css/bootstrap-theme.css");
require('font-awesome/scss/font-awesome.scss');
require("wdf/wdf/wdf_view.css");
require("./style.scss");


var _ = require('lodash');

var $ = window.jQuery = window.$ = require("jquery");
require("bootstrap/dist/js/bootstrap");

var path_template = _.template(require('raw!./templates/path.html'));

var WebFile = require('./WebFile');

var current_file;
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
    $('#header').html(path_template({
        file: current_file
    }));
    var url = '/.raw' + current_file.path() ;
    $('#main').html('');
    $.ajax({
        url: url,
        dataType: 'text',
        success: function(data,status,res){
            if(loading == current_file){
                current_file.setContent(res,status, data);
                var html = current_file.render();
                if( !_.isNull(html) ){
                    $('#main').html(html);
                }
            }
        }
    });
}

$(function(){
    $(document).on('click','[data-href]',function(e){
        navigate(e.target.getAttribute('data-href'),true);
    });
    $(document).on('click','a.wdf_link',function(e){
        navigate(e.target.getAttribute('href'),true);
        return false;
    });
    navigate(window.location.pathname);
});