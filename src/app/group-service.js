const admin = require("firebase-admin");
const serviceAccount = require("./../../config/gameboard-serviceAccountKey.json");
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();
module.exports = {
    createGroup: async (id,info) => {
        const docRef = db.collection('groups').doc(id)
        await docRef.set({
            group_name: info.group_name, 
            game_name: info.game_name,
            game_type: info.game_type, 
            slogan: info.slogan,
            intro: info.intro,
            admin_id: info.admin_id,
            admin_email: info.admin_email
        })
        return false;
    },
    getGroupById: async (id) =>{
        const doc = await db.collection('groups').doc(id).get()
        if (!doc.exists) {
          console.log('No such document!');
          return null;
        } else {
          console.log(doc)
          return doc.data();
        }
    }
}
// userData.email
// req.params.post_id
/*get all the groups for the user*/
/*join a group*/
/*leave a group*/
/*Create a group*/
/*Manage a group*/
