function generatePassword() {
    //const length = 12; 
    const length =  Math.random() * (15 - 12) + 12; // length of the password based on french governmental recommandations >=12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // character list taken randomly for each index of the password
    let password = ""; //

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length); // Get a random index
        password += charset.charAt(randomIndex); // Append the character at the random index to the password
    }

    document.getElementById('passwordDisplay').value = password; 
}

