const admin = require("firebase-admin");
const functions = require("firebase-functions");
const crypto = require("crypto");

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
        admin
          .auth()
          .setCustomUserClaims(userRecord.uid, {
            admin: snap.data().rol === "admin" ? true : false,
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
