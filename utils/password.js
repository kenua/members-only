const crypto = require('crypto')

module.exports.generatePassword = (plaintextPassword) => {
  let salt = crypto.randomBytes(32).toString('hex');
  let genHash = crypto
    .pbkdf2Sync(plaintextPassword, salt, 10000, 64, 'sha512')
    .toString('hex');
  
  return {
    salt: salt,
    hash: genHash,
  };
}

module.exports.isPasswordValid = (password, hash, salt) => {
  let hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return hash === hashVerify;
}