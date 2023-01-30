$(document).ready(function () {
  
  $(".btn").click(function (){
    
    $.ajax({
      type:'POST',
      url:'C:/xampp1/htdocs/PROJECTGAZETTEER/php/getCountryBorders.php',
      dataType:'json',
      success:function(data){
        $('#select_country').append(`<option value=${data.features.properties.iso_a3}>${data.features.properties.name}</option>`);
      },
      error:function(jqXHR, textStatus, errorThrown) {
        alert(errorThrown+ ' ' + jqXHR + ' ' + textStatus);
      }
      })      
  });  
});

