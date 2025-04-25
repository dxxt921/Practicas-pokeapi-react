/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
// Eliminamos o comentamos las variables no usadas:
// const onRequest = functions.https.onRequest;
// const logger = functions.logger;

// Exporta una función simple para evitar errores de deploy.
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});
