const UserService = require('./user-service');

describe('UserService', () => {
    it('creates users', async () => {
    /*
       const res = await UserService.createUser('789', 'test4@gmail.com', 'admin')
       console.log(res)
    */
       const res = await UserService.getUserByEmail('yy586@cornell.edu')
       console.log(res)
    })
})