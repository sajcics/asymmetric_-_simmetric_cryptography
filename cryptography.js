$(function() {

  loadTextFile()

  function loadTextFile() {
    $.ajax({
      url: "http://localhost:8000/dataToEcrypt/load",
      type: "GET",
      crossDomain: true,
      success: function(result) {
        $("#textToEcrypt").val(result.data)
      }
    });
  }

  $("#textToEncryptSave").click(function() {
    let dataToSend = {}
    dataToSend.data = $("#textToEcrypt").val()
    $.ajax({
      url: "http://localhost:8000/dataToEcrypt/save",
      data: dataToSend,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      crossDomain: true,
      success: function(result) {

      },
      error: function(xhr, status, error) {}
    })
  })

  $("#btnGntAsimetric").click(function() {
    $.ajax({
      url: "http://localhost:8000/generateAsimetric/generate",
      type: "GET",
      crossDomain: true,
      success: function(result) {
        $("#asimPrivateKey").val(result.privateKey)
        $("#asimPublicKey").val(result.publicKey)
        $("#asimEncrypt").val(result.encryptedStr)
        $("#asimDecrypt").val(result.decryptedStr)
        $("#hashFromOriginalTextString").val(result.hash)
        $("#digitalSignature").val(result.digitalSignature)
      },
      error: function(xhr, status, error) {
        if(xhr.status === 404) $("#asimetricimpossible").text("Mora postojati poruka kako bi se kreirali kljucevi")
      }
    });
  });

  $("#btnGntSimetric").click(function() {
    $.ajax({
      url: "http://localhost:8000/generateSimetric/generate",
      type: "GET",
      crossDomain: true,
      success: function(result) {
        $("#simSecretKey").val(result.secretKey)
        $("#simEncrypt").val(result.encryptedStr)
        $("#simDecrypt").val(result.decryptedStr)
      },
      error: function(xhr, status, error) {
        if(xhr.status === 404) $("#simetricimpossible").text("Mora postojati poruka kako bi se kreirao kljuc")
      }
    });
  });


  $("#btnGntDigSign").click(function() {
    $.ajax({
      url: "http://localhost:8000/generateAsimetric/signature",
      type: "GET",
      crossDomain: true,
      success: function(result) {
        $("#digitalSignatureEncrypted").val(result.digitalSignature)
      },
      error: function(xhr, status, error) {
        if(xhr.status === 404) $("#digitalSignatureSaved").text("Privatni kljuc ili poruka ne postoje")
      }
    });
  });

  $("#btnGntDigSignDecrypt").click(function() {
    $.ajax({
      url: "http://localhost:8000/generateAsimetric/signatureDecrypt",
      type: "GET",
      crossDomain: true,
      success: function(result) {
        $("#digitalSignatureDecrypted").val(result.digitalSignature)
        $("#fileIsCorrupted").text("Podaci nisu promjenjeni").removeClass("alert")
      },
      error: function(xhr, status, error) {
        if(xhr.status === 404) $("#fileIsCorrupted").text("Javni kljuc ili sazetak ne postoje")
        else $("#fileIsCorrupted").text("Podaci su promjenjeni!").addClass("alert")
      }
    });
  });

  $("#btnGntDigSignChange").click(function() {
    let dataToSend = {}
    dataToSend.data = $("#digitalSignatureEncrypted").val(),
      $.ajax({
        url: "http://localhost:8000/generateAsimetric/saveChangesInSignature",
        type: "GET",
        data: dataToSend,
        crossDomain: true,
        success: function(result) {
          $("#digitalSignatureSaved").text("Podaci spremljeni")
        },
        error: function(xhr, status, error) {
          console.log("error", xhr, status, error)
        }
      });
  });

})
