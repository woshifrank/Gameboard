const admin = require("firebase-admin");
const serviceAccount = require("./../../config/gameboard-serviceAccountKey.json");
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
    createUser: async (id,email,role) => {
        const docRef = db.collection('users').doc(id)
        await docRef.set({
            email: email,
            role: role,
        })
        return role
    },
    getUserById: async (id) =>{
        const doc = await db.collection('users').doc(id).get()
        if (!doc.exists) {
          console.log('No such document!');
          return null;
        } else {
          return doc.data();
        }
    },
    getUserByEmail: async(email) =>{
        userRef = db.collection('users')
        const user = await userRef.where("email", "==", email).limit(1).get()
        if (!user.docs[0]) {
            console.log('No matching documents.');
            return null;
        }else{
            //console.log(user.docs[0].data())
            return user.docs[0].data()
        }
    }

}