const GroupService = require('./group-service');

describe('GroupService', () => {
    it('creates group', async () => {
        group_info = {group_name:'Skyrim', 
            game_name: 'The Elder Scrolls V: Skyrim',
            game_type:'RPG', 
            slogan:'Welcome Dragonborns',
            intro:'Here houses the discussion channels for official annoucements, game storysharing, walkthroughs, meme sharing and game feedback',
            admin_id: 'WLTn2CaQq1eIDZtKsPitJmUBphB3',
            admin_email: 'yyjyang4@umich.edu'};
        await GroupService.createGroup('1',group_info)
        const group = await GroupService.getGroupById('1')
        expect(group.admin_email).toEqual('yyjyang4@umich.edu')
        expect(group.game_type).toEqual('RPG')
    })
})