'use strict';
var server = require('../../server/server');

module.exports = function (WebServiceWebServiceSoap12) {

  const MERCHANTID  = '5230502'
  const PASSWORD    = '5qrykgRTp'

  var soapDataSource = server.datasources.arianPalDs;
  var WebServiceWebServiceSoap12;

  soapDataSource.once('connected', function () {
    // Create the model
    WebServiceWebServiceSoap12 = soapDataSource.createModel('WebServiceWebServiceSoap12', {});
  });


  /**
   * RequestPayment
   * @param {RequestPayment} RequestPayment RequestPayment
   * @callback {Function} callback Callback function
   * @returns {any} callback containing error or result. Result is the response/soap body in JSON form.
   */
  WebServiceWebServiceSoap12.RequestPayment = function (RequestPayment, callback) {
    RequestPayment.MerchantID = MERCHANTID
    RequestPayment.Password = PASSWORD
    var utility = require('../../public/utility')
    RequestPayment.ResNumber = utility.generateUniqueId().toString()
    WebServiceWebServiceSoap12.RequestPayment(RequestPayment, function (err, response) {
      var transaction = server.models.apTransaction
      var data = {
        "MerchantID": MERCHANTID,
        "Password": PASSWORD,
        "Price": Number(RequestPayment.Price),
        "Description": JSON.parse(RequestPayment.Description),
        "Paymenter": RequestPayment.Paymenter,
        "Email": RequestPayment.Email,
        "Mobile": RequestPayment.Mobile,
        "ResNumber": RequestPayment.ResNumber.toString(),
        "ReturnPath": RequestPayment.ReturnPath,
        "ResultStatus": response.ResultStatus,
        "PaymentPath": response.PaymentPath,
        "RefNumber": RequestPayment.ResNumber.toString(),
      }
      transaction.create(data, function (err, result) {
        if (err)
          return callback(err, null)
        response.RefNumber = result.ResNumber
        callback(err, response);
      })
    });
  }

  /**
   * verifyPayment
   * @param {verifyPayment} verifyPayment verifyPayment
   * @callback {Function} callback Callback function
   * @returns {any} callback containing error or result. Result is the response/soap body in JSON form.
   */
  WebServiceWebServiceSoap12.verifyPayment = function (verifyPayment, callback) {
    verifyPayment.MerchantID = MERCHANTID
    verifyPayment.Password = PASSWORD
    WebServiceWebServiceSoap12.verifyPayment(verifyPayment, function (err, response) {
      var transaction = server.models.apTransaction
      transaction.find({'where':{'RefNumber': verifyPayment.refNum}}, function (err, transactionInst) {
        if (err)
          return callback(err, null)
        var data = {
          "VerificationStatus": response.ResultStatus.toString(),
          "PayementedPrice": Number(response.PayementedPrice)
        }
        if (transactionInst[0].RefNumber !== '0')
          return callback(err, null)
        transactionInst[0].updateAttributes(data, function (err, result) {
          if (err)
            return callback(err, null)
          var status = 'Successful'
          if (response.Status !== 'Success') 
            status = response.Status
          var data = {
            "time": Math.floor((new Date).getTime()),
            "price": Number(PaymentVerification.PayementedPrice),
            "status": status,
            "receiptInfo": result,
            "clientId": result.Description.clientId,
            "packageId": result.Description.packageId
          }
          var transaction = app.models.transaction
          transaction.create(data, function(transactionModel) {
            if (err)
              return callback(err)
            return callback(null, response)
          })
        })
      })
    });
  }

  // Map to REST/HTTP

  WebServiceWebServiceSoap12.remoteMethod('RequestPayment', {
    isStatic: true,
    produces: [{
        produces: 'application/json'
      },
      {
        produces: 'application/xml'
      }
    ],
    accepts: [{
      arg: 'RequestPayment',
      type: 'RequestPayment',
      description: 'RequestPayment',
      required: true,
      http: {
        source: 'body'
      }
    }],
    returns: [{
      arg: 'data',
      type: 'RequestPaymentResponse',
      description: 'RequestPaymentResponse',
      root: true
    }],
    http: {
      verb: 'post',
      path: '/RequestPayment'
    },
    description: 'RequestPayment'
  });

  WebServiceWebServiceSoap12.remoteMethod('verifyPayment', {
    isStatic: true,
    produces: [{
        produces: 'application/json'
      },
      {
        produces: 'application/xml'
      }
    ],
    accepts: [{
      arg: 'verifyPayment',
      type: 'verifyPayment',
      description: 'verifyPayment',
      required: true,
      http: {
        source: 'body'
      }
    }],
    returns: [{
      arg: 'data',
      type: 'verifyPaymentResponse',
      description: 'verifyPaymentResponse',
      root: true
    }],
    http: {
      verb: 'post',
      path: '/verifyPayment'
    },
    description: 'verifyPayment'
  });

}
