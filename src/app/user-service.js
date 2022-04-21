const admin = require("firebase-admin");
const serviceAccount = require("./../../config/gameboard-serviceAccountKey.json");
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();
module.exports = {
    createUser: async (id,email,role) => {
        const docRef = db.collection('users').doc(id)
        await docRef.set({
            email: email,
            role: role,
        })
        return false;
    },
    getUserById: async (id) =>{
        const doc = await db.collection('users').doc(id).get()
        if (!doc.exists) {
          console.log('No such document!');
          return null;
        } else {
          return doc.data();
        }
    }

}