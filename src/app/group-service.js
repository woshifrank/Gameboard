const admin = require("firebase-admin");
const serviceAccount = require("./../../config/gameboard-serviceAccountKey.json");
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();
module.exports = {
    getGroupById: async (id) =>{
        const doc = await db.collection('groups').doc(id).get()
        if (!doc.exists) {
          console.log('No such document!');
          return null;
        } else {
          //console.log(doc)
          return doc.data();
        }
    },
    getGroupByName: async (name) => {
        groupRef = db.collection('groups')
        const group = await groupRef.where("group_name", "==", name).limit(1).get()
        if (!group.docs[0]) {
            console.log('No matching documents.');
            return null;
        }else{
            console.log(group.docs[0].data())
            return group.docs[0].data()
        }
    },
    // TODO: check duplicate groups
    createGroup: async (info) => {
        // check if the group exists
        groupRef = db.collection('groups')
        const check = await groupRef.where("group_name", "==", info.group_name).limit(1).get()
        if(check.docs[0]){
            console.log('Error, group name exists!')
            return false;
        }
        const create_res = await db.collection('groups').add({
            group_name: info.group_name, 
            game_name: info.game_name,
            game_type: info.game_type, 
            slogan: info.slogan,
            intro: info.intro,
            admin_email: info.admin_email,
            user_emails:[info.admin_email]
        })
        const userRef = db.collection('users')
        const user_data = await userRef.where("email", "==", info.admin_email).limit(1).get()

        user = user_data.docs[0]
        let user_group = user.data().player_group_ids
        let admin_group = user.data().admin_group_ids
        if (!user_group){
            new_user_group = [create_res.id];
            new_admin_group = [create_res.id];
            await user.ref.update({
                player_group_ids: new_user_group,
                admin_group_ids: new_admin_group
            }).then(function() {
                console.log("User account update complete for new admin1");
            });
        }
        else{
            user_group.push(create_res.id)
            if (!admin_group){
                new_admin_group = [create_res.id]
            }
            else{
                new_admin_group = admin_group
                new_admin_group.push(create_res.id)
            }
            await user.ref.update({
                player_group_ids: user_group,
                admin_group_ids: new_admin_group
            }).then(function() {
                console.log("User account update complete for new admin2");
            });
        }
        /*
        user.forEach(doc => {
            let user_group = doc.data().player_group_ids
            let admin_group = doc.data().admin_group_ids
            if (!user_group){
                new_user_group = [create_res.id];
                new_admin_group = [create_res.id];
                const res = await doc.ref.update({
                    player_group_ids: new_user_group,
                    admin_group_ids: new_admin_group
                }).then(function() {
                    console.log("User account update complete for new admin1");
                });
            }
            else{
                user_group.push(create_res.id)
                if (!admin_group){
                    new_admin_group = [create_res.id]
                }
                else{
                    new_admin_group = admin_group
                    new_admin_group.push(create_res.id)
                }
                const res = await doc.ref.update({
                    player_group_ids: user_group,
                    admin_group_ids: new_admin_group
                }).then(function() {
                    console.log("User account update complete for new admin2");
                });
            }
        });*/
        return true;
    }
}
// userData.email
// req.params.post_id
/*get all the groups for the user*/
/*join a group*/
/*leave a group*/
/*Create a group*/
/*Manage a group*/
