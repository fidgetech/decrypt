import fs from 'fs';
import crypto from 'crypto';

const privateKeyPath = 'private_key.pem';
const importFilename = 'input.csv';
const exportFilename = 'export.csv';
const privateKey = crypto.createPrivateKey({ key: fs.readFileSync(privateKeyPath) });

const decrypt = (encryptedValue) => {
  try {
    return crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encryptedValue, 'base64')
    ).toString();
  } catch (error) {
    console.error(`Decryption error: ${error.message}`);
  }
};

const processFile = async () => {
  try {
    const data = await fs.promises.readFile(importFilename, 'utf8');
    const results = data.split('\n')
      .filter(line => line)
      .map(line => {
        const [email, encryptedValue] = line.split(',');
        const unquotedEmail = email.replace(/"/g, '');
        const decryptedValue = decrypt(encryptedValue);
        return `${unquotedEmail},${decryptedValue}`;
      });
    await fs.promises.writeFile(exportFilename, results.join('\n'));
    console.log('Export completed successfully.');
  } catch (err) {
    console.error(`Error processing file: ${err.message}`);
  }
};

processFile();
