$(document).ready(function(){
    $.getJSON("data/refigure-data.json", function ( data ) {
        for(var i=0; i<data.length; i++) {
            if(i%3 == 0){
                $('.container').append("<div class='row'>");
            }
            $(".container .row").last(".row").append('' +
                '<div class="col-sm-12\ col-md-4\ mb-3">' +
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
                '</div>');
            if( i%3 == 2 ){
                $('.container').append("</div>");

            }
        }
      
       $('.card').click(function () {$(this).toggleClass("fokusSelected")});

    });


});

