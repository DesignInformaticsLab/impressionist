$(function(){
    var objlabel = [
        { value: 'Acura'},
        { value: 'BMW' },
        { value: 'Cadillac' }
    ];
  
  // setup autocomplete function pulling from objlabel[] array
  $('#guessinput').autocomplete({
    lookup: objlabel,
    onSelect: function (suggestion) {
    }
  });
  

});