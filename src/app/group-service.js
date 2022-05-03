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
            //console.log(group.docs[0].data())
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
        // TODO: add multi select for channels
        groupRef = db.collection('groups')
        const check = await groupRef.where("group_name", "==", info.group_name).limit(1).get()
        if(check.docs[0]){
            console.log('Error, group name exists!')
            return false ;
        }
        console.log(info)    
        const create_res = await db.collection('groups').add({
            group_name: info.group_name, 
            game_name: info.game_name,
            game_type: info.game_type, 
            slogan: info.slogan,
            intro: info.intro,
            admin_email: info.admin_email,
            user_emails:[]
        })
        const userRef = db.collection('users')
        const user_data = await userRef.where("email", "==", info.admin_email).limit(1).get()

        user = user_data.docs[0]
        let admin_group = user.data().admin_group_ids
        if (!admin_group){
            new_admin_group = [create_res.id];
            await user.ref.update({
                admin_group_ids: new_admin_group
            }).then(function() {
                console.log("User account update complete for new admin1");
            });
        }
        else{
            new_admin_group = admin_group
            new_admin_group.push(create_res.id)
            await user.ref.update({
                admin_group_ids: new_admin_group
            }).then(function() {
                console.log("User account update complete for new admin2");
            });
        }
        return true;
    },
    /*
    info = {email, user_email}
    returns:
    {
      group_name: [intro,id]
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
            let group_id = group.id
            admin_groups[group_name] = [group_intro,group_id]
        }
        return admin_groups
    },
    /*
    info = {email:user_email
            group_name:
            }
    */
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
    /*
    info = {info.email}
    returns:
    {
      group_name: [intro,id]
      'CSGO-Mods': 'Here houses the discussion channels CSGO MOD making'
    }*/
    getUserPlayerGroup: async (info) =>{
        email = info.email
        groupRef = db.collection('groups')
        const groups = await groupRef.where("user_emails", "array-contains", email).get()
        player_groups = {}
        for (const group of groups.docs) {
            let group_name = group.data().group_name
            let group_intro = group.data().intro
            let group_id = group.id
            player_groups[group_name] = [group_intro,group_id]
        }
        return player_groups
    },
    /*only for group admin
    no channel changing here
    info:{email:user_email
          group_id: string,
          group_name:
          game_name:
          game_type:
          slogan:
          intro:
         }
    */
    changeGroup: async (info) => {
        email = info.email
        groupRef = db.collection('groups')
        const check = await groupRef.where("group_name", "==", info.group_name).limit(1).get()
        if(check.docs[0]){
            console.log('Error, group name exists!')
            return false ;
        }
        const group = await groupRef.doc(info.group_id).get()
        await group.ref.update({
            group_name: info.group_name,
            game_name: info.game_name,
            game_type: info.game_type,
            slogan: info.slogan,
            intro: info.intro
        })
        return true
    },
    /* Only for player*/
    /*
    info = {email:user_email
            group_name:
            }
    */
    leaveGroup: async(info) =>{
        groupRef = db.collection('groups')
        const check = await groupRef.where("group_name", "==", info.group_name).get()
        if(!check.docs[0]){
            console.log('Error, group name not exists!')
            return false;
        }
        cur_players = check.docs[0].data().user_emails
        // update group
        var player_set = new Set(cur_players);
        player_set.delete(info.email)
        let new_players = [...player_set];
        await check.docs[0].ref.update({
            user_emails: new_players})
        // update user
        const userRef = db.collection('users')
        const user = await userRef.where("email", "==", info.email).limit(1).get()
        user_groups = user.docs[0].data().player_group_ids
        var group_set = new Set(user_groups);
        group_set.delete(check.docs[0].id)
        await user.docs[0].ref.update({
            player_group_ids: [...group_set]})
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

