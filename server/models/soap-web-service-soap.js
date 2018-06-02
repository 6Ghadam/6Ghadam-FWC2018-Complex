'use strict';
var server = require('../../server/server');

module.exports = function (WebServiceWebServiceSoap) {

  const MERCHANTID  = '5230502'
  const PASSWORD    = '5qrykgRTp'

  var soapDataSource = server.datasources.arianPalDs;
  var WebServiceWebServiceSoap;

  soapDataSource.once('connected', function () {
    // Create the model
    WebServiceWebServiceSoap = soapDataSource.createModel('WebServiceWebServiceSoap', {});
  });


  /**
   * RequestPayment
   * @param {RequestPayment} RequestPayment RequestPayment
   * @callback {Function} callback Callback function
   * @returns {any} callback containing error or result. Result is the response/soap body in JSON form.
   */
  WebServiceWebServiceSoap.RequestPayment = function (RequestPayment, callback) {
    RequestPayment.MerchantID = MERCHANTID
    RequestPayment.Password = PASSWORD
    var utility = require('../../public/utility')
    RequestPayment.ResNumber = utility.generateUniqueId().toString()
    WebServiceWebServiceSoap.RequestPayment(RequestPayment, function (err, response) {
      var transaction = server.models.apTransaction
      var data = {
        "MerchantID": MERCHANTID,
        "Password": PASSWORD,
        "Price": Number(RequestPayment.Price),
        "Description": RequestPayment.Description,
        "Paymenter": RequestPayment.Paymenter,
        "Email": RequestPayment.Email,
        "Mobile": RequestPayment.Mobile,
        "ResNumber": RequestPayment.ResNumber.toString(),
        "ReturnPath": RequestPayment.ReturnPath,
        "ResultStatus": response.RequestPaymentResult.ResultStatus,
        "PaymentPath": response.RequestPaymentResult.PaymentPath
      }
      console.log(data)
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
  WebServiceWebServiceSoap.verifyPayment = function (verifyPayment, callback) {
    verifyPayment.MerchantID = MERCHANTID
    verifyPayment.Password = PASSWORD
    if (!verifyPayment.refNum || !verifyPayment.resNum || !verifyPayment.price)
      return callback(new Error('خطا! پارامتر‌های تائید پرداخت دستکاری شده‌اند.'))
    console.log(0)
    WebServiceWebServiceSoap.verifyPayment(verifyPayment, function (err, response) {
      var transaction = server.models.apTransaction
      transaction.find({'where':{'ResNumber': verifyPayment.resNum}}, function (err, transactionInst) {
        if (err)
          return callback(err, null)
        console.log(1)
        if (transactionInst[0].RefNumber !== '0')
          return callback(new Error('خطا! تراکنش قبلا ثبت‌ شده است.'), null)
        var data = {
          "VerificationStatus": response.verifyPaymentResult.ResultStatus.toString()
        }
        if (response.verifyPaymentResult)
          if (response.verifyPaymentResult.PayementedPrice)
            data.PayementedPrice = response.verifyPaymentResult.PayementedPrice
        if (verifyPayment)
          if (verifyPayment.refNum)
            data.refNumber = verifyPayment.refNum
        console.log(2)
        transactionInst[0].updateAttributes(data, function (err, result) {
          if (err)
            return callback(err, null)
          console.log(3)
          var status = 'Successful'
          if (response.verifyPaymentResult.ResultStatus !== 'Success') 
            status = response.verifyPaymentResult.ResultStatus
          var data = {
            "time": Math.floor((new Date).getTime()),
            "price": Number(response.verifyPaymentResult.PayementedPrice),
            "status": status,
            "receiptInfo": result,
            "clientId": result.Description.clientId,
            "packageId": result.Description.packageId
          }
          console.log(data)
          var transaction = app.models.transaction
          transaction.create(data, function(transactionModel) {
            if (err)
              return callback(err)
            console.log(4)
            return callback(null, response)
          })
        })
      })
    });
  }

  // Map to REST/HTTP

  WebServiceWebServiceSoap.remoteMethod('RequestPayment', {
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
      type: 'object',
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

  WebServiceWebServiceSoap.remoteMethod('verifyPayment', {
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
      type: 'object',
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
