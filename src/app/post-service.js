const admin = require("firebase-admin");
const serviceAccount = require("../../config/gameboard-serviceAccountKey.json");
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();
function test1(){
    console.log('hello');
}
module.exports = {
    /*return all channel names, intro, number of members*/
    /*return a channel's posts*/
    /*add a channel only for group admin*/
    /*modify channel intro* same-page/
    /*delete a channel only for group admin same-page*/

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