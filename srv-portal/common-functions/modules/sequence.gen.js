exports.nextSequence = (currentSequence) => {
    let letters = currentSequence.slice(0, 3);
    let numbers = parseInt(currentSequence.slice(3), 10);

    if (numbers < 999) {
      numbers += 1;
    } else {
      numbers = 1;
      let carry = 1;
      let newLetters = '';
      for (let i = letters.length - 1; i >= 0; i--) {
        let charCode = letters.charCodeAt(i);
        if (carry) {
          charCode += 1;
        }
        carry = 0;
        if (charCode > 90) {
          charCode = 65;
          carry = 1;
        }
        newLetters = String.fromCharCode(charCode) + newLetters;
      }
      letters = newLetters;
    }

    return `${letters}${String(numbers).padStart(3, '0')}`;
};