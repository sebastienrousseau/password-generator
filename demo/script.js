function generatePassword() {
    const lengthInput = document.getElementById('passwordLength');
    const length = parseInt(lengthInput.value); // Parse the input value as an integer

    const base64charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * base64charset.length);
        password += base64charset.charAt(randomIndex);
    }

    document.getElementById('passwordDisplay').value = password;
}

function copyPassword() {
    const passwordDisplay = document.getElementById('passwordDisplay');
    passwordDisplay.select();
    document.execCommand('copy');
}