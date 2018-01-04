const
    express = require("express")
    fs = require('fs')
    d = express.Router()

d.get("/load", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")

  fs.readFile("fileToEncrypt.txt", "utf8", function(error, data) {
    if(error) {
      res.status(400).send("Error: load file")
      return
    }
    res.status(200).json({"data": data})
  })
})

d.all("/save", async(req, res) => {
  res.header("Access-Control-Allow-Origin", "*")

  fs.writeFile("fileToEncrypt.txt", req.query.data, function(error, data) {
    if(error) {
      res.status(400).send("Error: save file")
      return
    }

    res.status(200).send("Ok")
  })
})

module.exports = d
