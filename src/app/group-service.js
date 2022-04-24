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
    // 
    /*
        {group_name:'CSGO-Mods', 
            game_name: 'Counter-Strike: Global Offensive',
            game_type:'FPS', 
            slogan:'Welcome, MOD makers and users!',
            intro:'Here houses the discussion channels CSGO MOD making',
            admin_email: 'yy586@cornell.edu'
        }
    */
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
        return true;
    },
    /*
    returns:
    {
      group_name: intro,
      'CSGO-Mods': 'Here houses the discussion channels CSGO MOD making'
    }
    */
    getUserAdminGroup: async (info) => {
        email = info.email
        groupRef = db.collection('groups')
        const groups = await groupRef.where("admin_email", "==", email).get()
        admin_groups = {}
        for (const group of groups.docs) {
            let group_name = group.data().group_name
            let group_intro = group.data().intro
            admin_groups[group_name] = group_intro
        }
        return admin_groups
    },
    joinGroup: async (info) => {
        email = info.email
        groupRef = db.collection('groups')
        const check = await groupRef.where("group_name", "==", info.group_name).limit(1).get()
        if(!check.docs[0]){
            console.log('Error, group name not exists!')
            return false;
        }
        cur_players = check.docs[0].data().user_emails
        cur_players.push(email)
        const new_group = await check.docs[0].ref.update({
            user_emails: cur_players})
        group_id = check.docs[0].id

        userRef = db.collection('users')
        const user_data = await userRef.where('email', "==", email).limit(1).get()
        user = user_data.docs[0]
        let user_group = user.data().player_group_ids
        if (!user_group){
            new_user_group = [group_id];
            await user.ref.update({
                player_group_ids: new_user_group,
            }).then(function() {
                console.log("User account updated for joining as player");
                return true;
            });
        }
        else{
            user_group.push(group_id)
            await user.ref.update({
                player_group_ids: user_group,
            }).then(function() {
                console.log("User account updated for joining as player2");
                return true;
            });
        }
    },

    getUserPlayerGroup: async (info) =>{

    },
    /*only for group admin*/
    changeGroup: async (info) => {
    },
    /* Only for player*/
    leaveGroup: async(info) =>{

    }
    /*Learn more: user can, explore the posts, but can't make posts 
comments, like -> join the group.*/

}
// userData.email
// req.params.post_id
/*get all the groups for the user*/
/*Manage a group*/
/*join a group*/
/*Users can leave a group, but admin can't
In future, we will add the feature to add/switch new admin*/

/*Learn more: user can, explore the posts, but can't make posts 
comments, like -> join the group.*/

