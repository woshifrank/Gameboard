const GroupService = require('./group-service');
const UserService = require('./group-service');

describe('GroupService', () => {
    it('creates group', async () => {
        info2 = {email: 'yy586@cornell.edu',
            group_name: 'Skyrim'
        }
        const res2 = await GroupService.leaveGroup(info2)
        /*
        info = {email: 'yy586@cornell.edu'}
        const res = await GroupService.getUserPlayerGroup(info)
        console.log(res['Skyrim'][1]) // get id
        */
        /*
        for (let name in res) {
            console.log(res[name][1])
        }*/
        /*
        info2 = {email: 'yy586@cornell.edu',
            group_name: 'The Elder Scrolls V: Skyrim'
        }
        const res2 = await GroupService.leaveGroup(info2)*/
        /*
        group_name: 'The Elder Scrolls V: Skyrim'
        info = {email: 'yy586@cornell.edu',
        group_name: 'Call of Duty: Warzone'}
        const res = await GroupService.joinGroup(info)
        */
        /*
        info = {email: 'yy586@cornell.edu',
            group_id: '8HiycoSJCFHur9Me4aI5',
            group_name: 'Counter-Strike: Global Offensive',
            game_name: 'Counter-Strike: Global Offensive',
            game_type: 'FPS',
            slogan: 'Welcome, FPS lovers!',
            intro: 'Here houses the discussion channels for official annoucements, game storysharing, walkthroughs, meme sharing and game feedback'
        }
        const res = await GroupService.changeGroup(info)
        //console.log(res)*/

        /*
        info = {email: 'yy586@cornell.edu'}
        const res = await GroupService.getUserAdminGroup(info)
        console.log(res)
        */

        /*
        group_info = {group_name:'Call of Duty: Warzone', 
            game_name: 'Call of Duty: Warzone',
            game_type:'FPS', 
            slogan:'Welcome, COD players!',
            intro:'Here houses the discussion channels for COD Warzone',
            admin_email: 'yyjyang4@umich.edu'};
        const res = await GroupService.createGroup(group_info)
        */

        // const group = await GroupService.getGroupByName('Skyrim')

        /*
        const group = await GroupService.getGroupByName('CSGO')
        //expect(group.game_name).toEqual('The Elder Scrolls V: Skyrim')
        console.log(group)
        */

        //const group = await GroupService.getGroupById('1')
        //expect(group.admin_email).toEqual('yyjyang4@umich.edu')
        //expect(group.game_type).toEqual('RPG')
        // const user = await UserService.getUserById('WLTn2CaQq1eIDZtKsPitJmUBphB3')
        //console.log(user)
    })
})