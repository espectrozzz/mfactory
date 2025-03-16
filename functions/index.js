const admin = require("firebase-admin");
const functions = require("firebase-functions/v1");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

/*
exports.initApp = functions.auth.user().onCreate((user) => {
  admin.auth().setCustomUserClaims(user.uid, {
    rol: "admin"
  })
})
*/


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

/*
exports.initializeInventory = functions.firestore
  .document("tiposDeFardos/{docId}")
  .onCreate((snap, context) => {
    admin.firestore().collection("inventory").doc(snap.data().name).set({
      created_at: FieldValue.serverTimestamp(),
      value: 0,
      in_stock: false,
    });
  });
  */

exports.uploadInventory = functions.firestore
  .document("entradas/{docId}")
  .onCreate((snap, context) => {
    const values = snap.data();
    snap.data().data.forEach((value) => {
      admin
        .firestore()
        .collection("inventory")
        .doc(value.fardoId)
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
      const inventoryItem = await admin.firestore().collection("inventory").doc(value.fardoId).get()
      admin
        .firestore()
        .collection("inventory")
        .doc(value.fardoId)
        .update({
          value: FieldValue.increment(-value.value),
          in_stock: value.value >= inventoryItem.data().value ? false : true,
          updated_at: FieldValue.serverTimestamp(),
        });
    });
  });

// control fardos
exports.createFardo = functions.https.onCall(async (data) => {
  const { name, uid, userName } = data;
  const db = admin.firestore();

  if(!name || !uid || !userName) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan datos')
  }

  try {
    const tipoFardoRef = await db.collection("tiposDeFardos").add({
      created_at: FieldValue.serverTimestamp(),
      name: name,
      uid: uid,
      userName: userName
    });

    await db.collection("inventory").doc(tipoFardoRef.id).set({
      created_at: FieldValue.serverTimestamp(),
      in_stock: false,
      value: 0,
      name: name
    });

    return { message: "Fardo creado correctamente", code: 200 };
    
  } catch (error) {
    throw new functions.https.HttpsError('service-invalid', 'El servicio para crear fardos no está disponible.')
  }

});

exports.updateFardo = functions.https.onCall(async (data) => {
  const { newName, uid, id } = data;
  const db = admin.firestore();

  if(!newName || !uid || !id) {
    throw new functions.https.HttpsError('invalid-argument', 'Faltan datos.');
  }

  try {
    await db.collection("tiposDeFardos").doc(id).update({
      name: newName,
      updated_at: FieldValue.serverTimestamp(),
      updated_by: uid
    });

    await db.collection("inventory").doc(id).update({
      name: newName
    })
  } catch (error) {
    throw new functions.https.HttpsError('invalid-service', 'Servicio no disponible, intenta más tarde.');
  }
});


// control usuarios

exports.createUser = functions.https.onCall(async (data, context) => {
  const randomPassword = generateRandomPassword(6);
  const { nombre, apellido_paterno, email, rol } = data;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      emailVerified: true,
      password: randomPassword,
      displayName: `${nombre} ${apellido_paterno}`,
      disabled: false,
      rol: rol
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      rol: rol
    });

    await admin.firestore().collection("colaboradores").doc(userRecord.uid).set({ ...data, fecha_creacion: FieldValue.serverTimestamp() });

    return { message: "Se creó el usuario con éxito", code: 200 };

  } catch (error) {
    throw new functions.https.HttpsError('invalid-service', 'Error al crear usuario, intente de nuevo.');
  }
});


exports.updateUser = functions.https.onCall(async (data, context) => {
  const { uid, newName, newLastName1, newLastName2, newRol } = data;
  if (!newName) {
    throw new functions.https.HttpsError('invalid-argument', 'Se debe proporcionar un nombre.');
  }

  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Identificador de usuario invalido.');
  }

  const db = admin.firestore();
  const auth = admin.auth();
  
  const userDoc = await db.collection("colaboradores").doc(uid).get();
  const oldName = userDoc.data().nombre;
  const oldLastName = userDoc.data().apellido_paterno;

  try {
    await db.collection("colaboradores").doc(uid).update({ nombre: newName, apellido_paterno: newLastName1, apellido_materno: newLastName2, rol: newRol, fecha_modificacion: FieldValue.serverTimestamp() });
   
    await auth.updateUser(uid, { displayName: `${newName} ${newLastName1}` });

    await auth.setCustomUserClaims(uid, {
      rol: newRol
    });

    return { message: "Usuario actualizado", code: 200 };
  } catch (error) {
    throw new functions.https.HttpsError('invalid', 'Ocurrió un error, intente más tarde.')
  }

});
