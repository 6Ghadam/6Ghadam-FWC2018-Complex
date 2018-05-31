
'use strict';
var server = require('../../server/server');

module.exports = function(WebServiceWebServiceSoap) {

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
  WebServiceWebServiceSoap.RequestPayment = function(RequestPayment, callback) {
      WebServiceWebServiceSoap.RequestPayment(RequestPayment, function (err, response) {
        var result = response;
        callback(err, result);
      });
  }
  
  /**
   * verifyPayment
   * @param {verifyPayment} verifyPayment verifyPayment
   * @callback {Function} callback Callback function
   * @returns {any} callback containing error or result. Result is the response/soap body in JSON form.
   */
  WebServiceWebServiceSoap.verifyPayment = function(verifyPayment, callback) {
      WebServiceWebServiceSoap.verifyPayment(verifyPayment, function (err, response) {
        var result = response;
        callback(err, result);
      });
  }
  
  // Map to REST/HTTP

  WebServiceWebServiceSoap.remoteMethod('RequestPayment',
  { isStatic: true,
  produces: 
   [ { produces: 'application/json' },
     { produces: 'application/xml' } ],
  accepts: 
   [ { arg: 'RequestPayment',
       type: 'RequestPayment',
       description: 'RequestPayment',
       required: true,
       http: { source: 'body' } } ],
  returns: 
   [ { arg: 'data',
       type: 'RequestPaymentResponse',
       description: 'RequestPaymentResponse',
       root: true } ],
  http: { verb: 'post', path: '/RequestPayment' },
  description: 'RequestPayment' }
  );
  
  WebServiceWebServiceSoap.remoteMethod('verifyPayment',
  { isStatic: true,
  produces: 
   [ { produces: 'application/json' },
     { produces: 'application/xml' } ],
  accepts: 
   [ { arg: 'verifyPayment',
       type: 'verifyPayment',
       description: 'verifyPayment',
       required: true,
       http: { source: 'body' } } ],
  returns: 
   [ { arg: 'data',
       type: 'verifyPaymentResponse',
       description: 'verifyPaymentResponse',
       root: true } ],
  http: { verb: 'post', path: '/verifyPayment' },
  description: 'verifyPayment' }
  );
  
}
