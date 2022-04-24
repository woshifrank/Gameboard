const GroupService = require('./group-service');
const UserService = require('./group-service');

describe('GroupService', () => {
    it('creates group', async () => {
        
        info = {email: 'yy586@cornell.edu'}
        const res = await GroupService.getUserAdminGroup(info)
        console.log(res)

        /*
        info = {email: 'yy586@cornell.edu',
        group_name: 'Call of Duty: Warzone'}
        const res = await GroupService.joinGroup(info)
        */

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