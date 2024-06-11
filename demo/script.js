function generatePassword() {
    // Getting input data from html
    const lengthInput = document.getElementById('iterationLength');
    const separatorInput = document.getElementById('separator')
    const iterationInput = document.getElementById('iteration')

    // Parsing input
    const length = parseInt(lengthInput.value); 
    const iteration = parseInt(iterationInput.value);
    const separator = separatorInput.value;

    const base64charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/";
    let password = "";

    for (let j = 0; j<iteration; j++) {
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * base64charset.length);
            password += base64charset.charAt(randomIndex);
        }
        if(j<iteration-1) {
            password+=separator;
        }
    }

    document.getElementById('passwordDisplay').value = password;
}

function copyPassword() {
    const passwordDisplay = document.getElementById('passwordDisplay');
    passwordDisplay.select();
    document.execCommand('copy');
    console.log('password copied')
}