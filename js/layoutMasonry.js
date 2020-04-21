$(document).ready(function(){
    $.getJSON("data/refigure-data.json", function ( data ) {
        $('.container').append('<div class="card-columns">');
        for(var i=0; i<data.length; i++) {            
            $(".card-columns").append(''+
                '<div class="card\ animated\ zoomInUp">' +
                '<h4 class="card-header">'+data[i].stilmittel+'</h4>' +
                '<div class="card-block">' +
                '<h6 class="card-title">Beschreibung</h6>' +
                '<p class="card-text">'+data[i].beschreibung+'</p>' +
                '</div>' +
                '<div class="card-block\ card-block-beispiel">' +
                '<p class="card-text">'+data[i].beispiel+'</p>' +
                '</div>' +
                '<div class="card-footer">'+data[i].effekt+'</div>' +
                '</div>' +
                '</div>'+'</div>');
           
        }
      
       $('.card').click(function () {$(this).toggleClass("fokusSelected")});

    });


});

