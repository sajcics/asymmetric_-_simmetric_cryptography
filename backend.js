const
    express = require("express")
    app = express()
    router = express.Router()
    crypto = require('crypto')
    bodyParser = require("body-parser")

app.listen(8000)
app.use(router)
let bodyParserJSON = bodyParser.json()

router.use("/generateAsimetric", bodyParserJSON, require("./backend/generateAsimetric.js"))
router.use("/generateSimetric", require("./backend/generateSimetric.js"))
router.use("/dataToEcrypt", bodyParserJSON, require("./backend/dataForEcryption.js"))
