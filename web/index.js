require("bootstrap/dist/css/bootstrap.css");
require("bootstrap/dist/css/bootstrap-theme.css");
require('font-awesome/scss/font-awesome.scss');
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
                $('#main').html( current_file.render() );
            }
        }
    });
}

$(function(){
    var pressed = false;
    var colname, startX, startWidth;

    $(document).on('mousedown','[data-resize-col]',function(e) {
        colname = $(this).attr('data-resize-col');
        pressed = true;
        startX = e.pageX;
        startWidth = $(this).before().width() ;
        console.log(colname);

    });

    $(document).mousemove(function(e) {
        if(pressed) {
            $('[data-size-col="'+colname+'"]')
                .width(startWidth+(e.pageX-startX));
        }
    });

    $(document).mouseup(function() {
        if(pressed) {
            pressed = false;
        }
    });
    $(document).on('click','[data-href]',function(e){
        navigate(e.target.getAttribute('data-href'),true);
    });
    navigate(window.location.pathname);
});