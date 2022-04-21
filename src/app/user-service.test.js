const UserService = require('./user-service');

describe('UserService', () => {
    it('creates users', async () => {
        await UserService.createUser('123', 'danny@example.com', 'admin')
        await UserService.createUser('234', 'bob@example.com', 'player')
        const user = await UserService.getUserById('123')
        expect(user.email).toEqual('danny@example.com')
        expect(user.role).toEqual('admin')
    })
})