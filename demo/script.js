function generatePassword() {
    // Getting input data from html
    const lengthInput = document.getElementById('iterationLength');
    const separatorInput = document.getElementById('separator')
    const iterationInput = document.getElementById('iteration')
    const includeSpecialChars = document.getElementById('specialChars').checked;
    const includeDigits = document.getElementById('digits').checked;

    // Parsing input
    const length = parseInt(lengthInput.value); 
    const iteration = parseInt(iterationInput.value);
    const separator = separatorInput.value;

    const baseCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const specialChars = "+/";

    let charset = baseCharset;
    if (includeDigits) {
        charset += digits;
    }
    if (includeSpecialChars) {
        charset += specialChars;
    }


    let password = "";

    for (let j = 0; j<iteration; j++) {
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }
        if(j<iteration-1) {
            password+=separator;
        }
    }

    document.getElementById('passwordDisplay').value = password;

    // Change the copy button color depending on the length of the code
    const copyButton = document.getElementById('copyButton');
    if (password.length < 3) {
        copyButton.style.backgroundColor = "#8B0000"; // Dark red
    }
    else if (password.length < 6) {
        copyButton.style.backgroundColor = "#FF0000"; // Red
    }
    else if (password.length < 8) {
        copyButton.style.backgroundColor = "#FFFF00"; // Yellow
    }
    else if (password.length < 11) {
        copyButton.style.backgroundColor = "#ADFF2F"; // Green
    }
    else {
        copyButton.style.backgroundColor = "#32CD32"; // Dark green
    }

}



function copyPassword() {
    const passwordDisplay = document.getElementById('passwordDisplay');
    passwordDisplay.select();
    document.execCommand('copy');
    console.log('password copied')
}