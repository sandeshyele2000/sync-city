// Example using AES-256-CBC encryption with Node.js crypto module

const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32); // Generate a random secret key (should be securely stored)
const iv = crypto.randomBytes(16); // Generate a random IV (Initialization Vector)

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Example usage
const originalText = "Sensitive data to encrypt";
const encryptedText = encrypt(originalText);
console.log("Encrypted:", encryptedText);

const decryptedText = decrypt(encryptedText);
console.log("Decrypted:", decryptedText);
