const admin = require("firebase-admin");
const serviceAccount = require("../../config/gameboard-serviceAccountKey.json");
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();
module.exports = {
    /*return a group info, name, slogans, intro, number of members, time*/
    /*return a group's posts*/
    /*make a post*/

    /*For future: modify channel intro same-page
    delete a channel only for group admin same-page*/

    makePost: async(info) =>{
        /*
            group_name
            title
            body
            author
            time
        */
       //const date = dateCreated.toDate().toDateString()
       // const todayAsTimestamp = admin.firestore.Timestamp.now()
        groupRef = db.collection('groups')
        postRef = db.collection('posts')
        let check = await groupRef.where("group_name", "==", info.group_name).limit(1).get()
        if(!check.docs[0]){
            console.log('Invalid group name')
            return false ;
        }
        const currentTimestamp = admin.firestore.Timestamp.now()   
        const create_res = await db.collection('posts').add({
            group_name: info.group_name, 
            title: info.title,
            body: info.post_body,
            author: info.author,
            time: currentTimestamp.toDate().toDateString()
        })
        let post_ids = check.docs[0].data().post_ids
        if (!post_ids){
            console.log('error')
            new_post_ids = [create_res.id];
            await check.docs[0].ref.update({
                post_ids: new_post_ids
            }).then(function() {
                console.log("Group update complete for new post");
            });
        }
        else{
            post_ids.push(create_res.id)
            await check.docs[0].ref.update({
                post_ids: post_ids
            }).then(function() {
                console.log("Group update complete for new post2");
            });
        }
        return true;
    },
    getPostByGroupId: async (id) =>{
        const group_doc = await db.collection('groups').doc(id).get()
        if (!group_doc) {
          console.log('No such group');
          return false;
        } else {
            post_info = {}
            const post_ids = group_doc.data().post_ids;
            if(post_ids){
                for (const p_id of post_ids) {
                    const post_doc = await db.collection('posts').doc(p_id).get()
                    post_info[p_id] = [post_doc.data().title,post_doc.data().body, 
                        post_doc.data().author,post_doc.data().time]
                }
            }
            return post_info
        }
    }

}