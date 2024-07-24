const admin = require("firebase-admin");
const functions = require("firebase-functions");
const crypto = require("crypto");
const { increment } = require("firebase/firestore");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

exports.createUser = functions.firestore
  .document("colaboradores/{docId}")
  .onCreate((snap, context) => {
    const randomPassword = generateRandomPassword(6);
    admin
      .auth()
      .createUser({
        email: snap.data().email,
        emailVerified: true,
        password: randomPassword,
        displayName: `${snap.data().nombre} ${snap.data().apellido_paterno}`,
        disabled: false,
      })
      .then((userRecord) => {
        admin.auth().setCustomUserClaims(userRecord.uid, {
          rol: snap.data().rol,
        });
        admin
          .firestore()
          .collection("colaboradores")
          .doc(snap.id)
          .update({ uid: userRecord.uid });
      });
  });

exports.disableUser = functions.https.onCall(async (data, context) => {
  await admin.auth().updateUser(data.uid, {
    disabled: true,
  });
});

function generateRandomPassword(length) {
  // Define the characters to be used in the password
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#$@";
  let password = "";
  // Use crypto to generate random bytes and convert them to characters
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomBytes(1)[0] % chars.length;
    password += chars[randomIndex];
  }
  return password;
}

exports.initializeInventory = functions.firestore
  .document("tiposDeFardos/{docId}")
  .onCreate((snap, context) => {
    admin.firestore().collection("inventory").doc(snap.data().name).set({
      created_at: FieldValue.serverTimestamp(),
      value: 0,
      in_stock: false,
    });
  });

exports.uploadInventory = functions.firestore
  .document("entradas/{docId}")
  .onCreate((snap, context) => {
    const values = snap.data();
    snap.data().data.forEach((value) => {
      admin
        .firestore()
        .collection("inventory")
        .doc(value.tipoFardo)
        .update({
          value: FieldValue.increment(1),
          in_stock: true,
          updated_at: FieldValue.serverTimestamp(),
        });
    });
  });

exports.outgoingInventory = functions.firestore
  .document("salidas/{docId}")
  .onCreate((snap, context) => {
    snap.data().data.forEach(async (value) => {
      const inventoryItem = await admin.firestore().collection("inventory").doc(value.tipoFardo).get()
      admin
        .firestore()
        .collection("inventory")
        .doc(value.tipoFardo)
        .update({
          value: FieldValue.increment(-value.value),
          in_stock: value.value >= inventoryItem.data().value ? false : true,
          updated_at: FieldValue.serverTimestamp(),
        });
    });
  });
