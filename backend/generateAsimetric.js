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

d.get("/generate", async(req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  let rsa = new chilkat.Rsa()

  let success = rsa.UnlockComponent(222)
  if (success !== true) {
    res.status(400).send("Error: ", rsa.LastErrorText)
    return
  }

  success = rsa.GenerateKey(2048)

  let pubKey = rsa.ExportPublicKeyObj()
  let privKey = rsa.ExportPrivateKeyObj()
  let bChoosePkcs1 = true

  let pubKeyBase64 = pubKey.GetEncoded(bChoosePkcs1, "hex")
  let privKeyBase64 = privKey.GetPkcs1ENC("hex")

  jsonResponse.privateKey = privKeyBase64
  jsonResponse.publicKey = pubKeyBase64

  let s1 = privKey.SavePemFile("privateKey.pem")
  let s2 = pubKey.SavePemFile(false, "publicKey.pem")

  fs.writeFile("keys/privatni_kljuc.txt", privKeyBase64, function(error) {
    if (error) {
      res.status(400).send("Error: save private key")
      return
    }

    fs.writeFile("keys/javni_kljuc.txt", pubKeyBase64, function(error) {
      if (!error) {
        encrypt(pubKey, res, function() {
          decrypt(privKey, res, function() {
            hash(res)
          })
        })
      } else {
        res.status(400).send("Error: save public key")
        reeturn
      }
    })
  })
})

function encrypt(publicKey, res, callback) {
  let rsaEncryptor = new chilkat.Rsa()
  let success = rsaEncryptor.UnlockComponent(222)
  if (success !== true) {
    res.status(400).send("Error: cannot unlock component")
  }

  rsaEncryptor.EncodingMode = "hex"
  success = rsaEncryptor.ImportPublicKeyObj(publicKey)

  fs.readFile("fileToEncrypt.txt", "utf8", function(error, data) {
    if (error) {
      res.status(404).send("Error: read a file fileToEncrypt.txt")
      return
    }
    let usePrivateKey = false
    let encryptedStr = rsaEncryptor.EncryptStringENC(data, usePrivateKey)
    jsonResponse.encryptedStr = encryptedStr
    jsonResponse.clearText = data

    fs.writeFile("fileEncryptedAsimetric.txt", encryptedStr, function(error) {
      if (error) {
        res.status(400).send("Error: read a file encryptAsimetric")
        return
      }
      callback(null)
    })
  })
}

function decrypt(privateKey, res, callback) {
  let rsaDecryptor = new chilkat.Rsa()

  rsaDecryptor.EncodingMode = "hex"
  let success = rsaDecryptor.UnlockComponent(222)
  if (success !== true) {
    res.status(400).send("Error: ", rsaDecryptor.LastErrorText)
    return
  }

  success = rsaDecryptor.ImportPrivateKeyObj(privateKey)
  usePrivateKey = true
  fs.readFile("fileEncryptedAsimetric.txt", "utf8", function(error, data) {
    if (error) {
      res.status(400).send("error: read fileEncryptedAsimetric")
      return
    }

    let decryptedStr = rsaDecryptor.DecryptStringENC(data, usePrivateKey)
    jsonResponse.decryptedStr = decryptedStr
    callback(null)
  })
}

function hash(res, callback) {
  fs.readFile("fileToEncrypt.txt", "utf8", function(error, data) {
    if (error) {
      res.status(400).send("Error: read fileToEncrypt.txt")
      return
    }

    let hashString = generateHash(data, function(hashString) {
      fs.writeFile("hash/hash-sha256.txt", hashString, function(error) {
        if (error) {
          res.status(400).send("Error: write /hash/hash-sha256.txt", error)
          return
        }

        res.status(200).json(jsonResponse)
      })
    })
  })
}

function generateHash(data, callback) {
  let crypt = new chilkat.Crypt2()
  var success = crypt.UnlockComponent(222);
  if (success !== true) {
    console.log(crypt.LastErrorText);
    return;
  }
  crypt.HashAlgorithm = "SHA-256"
  crypt.Charset = "utf-8";
  crypt.EncodingMode = "base64";
  let hashString = crypt.HashStringENC(data);
  jsonResponse.hash = hashString
  callback(hashString)
}

d.get("/signature", async(req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  jsonResponse = {}

  let privateKey = new chilkat.PrivateKey()
  let success = privateKey.LoadPemFile("privateKey.pem")
  if (success !== true) {
    res.status(404).send("Error: getPrivateKey")
    return
  }

  fs.readFile("hash/hash-sha256.txt", "utf8", function(error, hash) {
    let rsaEncryptor = new chilkat.Rsa()
    let success = rsaEncryptor.UnlockComponent(222)
    if (success !== true) {
      res.status(400).send("Error: cannot unlock component")
      return
    }

    rsaEncryptor.EncodingMode = "hex"
    success = rsaEncryptor.ImportPrivateKeyObj(privateKey)
    if (success !== true) {
      res.status(400).send("Error: cannot unlock component")
      return
    }

    fs.readFile("fileToEncrypt.txt", "utf8", function(error, data) {
      if (error) {
        res.status(404).send("Error: read a file fileToEncrypt.txt")
        return
      }

      let usePrivateKey = true
      let digitalSignatureEncrypted = rsaEncryptor.EncryptStringENC(hash, usePrivateKey)

      fs.writeFile("digitalSignatureEncrypted.txt", digitalSignatureEncrypted, function(error) {
        if (error) {
          res.status(400).send("Error: write file digitalSignatureEncrypted.txt")
          return
        }
        jsonResponse.digitalSignature = digitalSignatureEncrypted

        res.status(200).json(jsonResponse)
      })
    })
  })
})

d.get("/signatureDecrypt", async(req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  jsonResponse = {}
  let rsaDecryptor = new chilkat.Rsa()

  rsaDecryptor.EncodingMode = "hex"
  let success = rsaDecryptor.UnlockComponent(222)
  if (success !== true) {
    res.status(400).send("Error: ", rsaDecryptor.LastErrorText)
    return
  }

  let publicKey = new chilkat.PublicKey()
  success = publicKey.LoadFromFile("publicKey.pem")
  if (success !== true) {
    res.status(404).send("Error: getPublicKey")
    return
  }

  success = rsaDecryptor.ImportPublicKeyObj(publicKey)
  if (success !== true) {
    res.status(404).send("Error: getPublicKey")
    return
  }

  usePrivateKey = false
  fs.readFile("digitalSignatureEncrypted.txt", "utf8", function(error, data) {
    if (error) {
      res.status(404).send("error: read fileEncryptedAsimetric")
      return
    }

    let decryptedStr = rsaDecryptor.DecryptStringENC(data, usePrivateKey)
    jsonResponse.digitalSignature = decryptedStr

    compareDigSignatureAndHash(decryptedStr, function(different) {
      if (different !== true) {
        jsonResponse.different = false
        res.status(200).json(jsonResponse)
      } else res.status(400).json({"different": true})
    })
  })
})

function compareDigSignatureAndHash(signature, callback) {
  fs.readFile("fileToEncrypt.txt", "utf8", function(error, data) {
    if(error) {
      res.status(404).send("error: read fileToEncrypt.txt")
      return
    }
    generateHash(data, function(hashString) {
      if (hashString !== signature) callback(true)
      else callback(false)
    })
  })
}

d.get("/saveChangesInSignature", async(req, res) => {
  res.header("Access-Control-Allow-Origin", "*")

  let newDigitalSignature = req.query.data
  fs.writeFile("digitalSignatureEncrypted.txt", newDigitalSignature, function(error) {
    if (error) {
      res.status(400).send("Error: write digitalSignatureEncrypted.txt")
      return
    }

    res.status(200).send("Ok")
  })
})

module.exports = d
