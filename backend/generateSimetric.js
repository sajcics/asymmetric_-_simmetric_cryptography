const
  express = require("express")
  fs = require('fs')
  d = express.Router()
  jsonResponse = {}
  chilkat = require('chilkat_node8_linux64')

let os = require('os')
if (os.platform() == 'win32') {
  chilkat = require('chilkat_node8_win32')
} else if (os.platform() == 'linux') {
  if (os.arch() == 'arm') {
    chilkat = require('chilkat_node8_arm')
  } else if (os.arch() == 'x86') {
    chilkat = require('chilkat_node8_linux32')
  } else {
    chilkat = require('chilkat_node8_linux64')
  }
}

d.get("/generate", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")

  let aes = new chilkat.Crypt2()
  aes.CryptAlgorithm = "aes"
  aes.KeyLength = 256

  let prng = new chilkat.Prng()
  let secretKeyBase64 = prng.GenRandom(32, "hex")

  fs.writeFile("keys/tajni_kljuc.txt", secretKeyBase64, function(error) {
    if (error) {
      res.status(400).send("Error while generating secret key")
      return
    }
    jsonResponse.secretKey = secretKeyBase64

    encrypt(res, function() {
      decrypt(secretKeyBase64, res)
    })
  })
})

function encrypt(res, callback) {
  var aes = new chilkat.Crypt2()

  var success = aes.UnlockComponent(222)
  if (success !== true) {
    res.status(400).send("Error: unlock component")
    return
  }

  aes.CryptAlgorithm = "aes"
  aes.CipherMode = "ebc"
  aes.KeyLength = 256

  fs.readFile("keys/tajni_kljuc.txt", "utf8", function(error, data) {
    if (error) {
      res.status(400).send("Error: read a file")
      return
    }
    let inFile = "fileToEncrypt.txt"
    let outFile = "fileEcryptedSimetric.txt"
    aes.SetEncodedKey(data, "hex")

    success = aes.CkEncryptFile(inFile, outFile)
    if (success !== true) {
      res.status(404).send("Error: crypt to file")
      return
    }

    fs.readFile("fileEcryptedSimetric.txt", "utf8", function(error, data) {
      if (error) {
        res.status(404).send("Error read fileEcryptedSimetric.txt")
        return
      }
      jsonResponse.encryptedStr = data
      callback(null)
    })
  })
}

function decrypt(secretKey, res) {
  res.header("Access-Control-Allow-Origin", "*")

  let aes = new chilkat.Crypt2()
  var success = aes.UnlockComponent(222)
  if (success !== true) {
    res.status(400).send("Error UnlockComponent")
    return
  }

  aes.CryptAlgorithm = "aes"
  aes.CipherMode = "ebc"
  aes.KeyLength = 256
  aes.SetEncodedKey(secretKey, "hex")

  let inFile = "fileEcryptedSimetric.txt"
  let outFile = "fileDecryptedSimetric.txt"
  success = aes.CkDecryptFile(inFile, outFile)
  if (success !== true) {
    res.status(400).send("Error: decrypt file")
    return
  }

  fs.readFile("fileDecryptedSimetric.txt", "utf8", function(error, data) {
    if (error) {
      res.status(400).send("Error read file fileDecryptedSimetric.txt")
      return
    }
    jsonResponse.decryptedStr = data

    res.status(200).json(jsonResponse)
  })
}

module.exports = d
