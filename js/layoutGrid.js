$(document).ready(function(){
    $.getJSON("data/refigure-data.json", function ( data ) {
        for(var i=0; i<data.length; i++) {
            if(i%3 == 0){
                $('.container').append("<div class='row'>");
            }
            $(".container .row").last(".row").append('' +
                '<div class="col-sm-12\ col-lg-4\ mb-3\">' +
                '<div class="card mt-4" data-scroll>' +
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
            //$('.card').click(function () {$(this).toggleClass("fokusSelected");});
            
            
            $('.card-header').append('<button class="float-right\ addCardElement" title="Element hinzuf&uuml;gen" alt="Card Hinzuf&uuml;gen Knopf"><i class="far\ fa-plus-square"></i></button>');
            
            
        }).done(function(){

        var state = "idle";
        $('.addCardElement i').click(function(){          
               $(this).removeClass("far\ fa-plus-square");
               $(this).addClass("far\ fa-check-square greenCol").attr("title", "Element hinzugefügt");
               state = "checked";
               console.log("state1: "+state);
           });
           $('.addCardElement i').click(function(){                       
                if(!$(this).hasClass("far\ fa-check-square greenCol") && state == "checked"){
                    $(this).removeClass("far\ fa-check-square greenCol").addClass("far\ fa-plus-square").attr("title", "Element hinzufügen");
                }
                state = "idle";
               console.log("state2: "+state);
           });




           
           ScrollOut({
            
          });
   
    });


});

