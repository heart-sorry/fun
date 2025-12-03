// 用户数据文件 - 分离管理不同用户的内容
const usersContent = {
    admin: {
        username: 'admin',
        password: 'admin123'
    },
    user1: {
        username: 'user1',
        password: 'user1123'
    },
    user2: {
        username: 'user2',
        password: 'user2123'
    },
    user3: {
        username: 'user3',
        password: 'user3123'
    },
    user4: {
        username: 'user4',
        password: 'user4123'
    },
    user5: {
        username: 'user5',
        password: 'user5123'
    },
    user6: {
        username: 'user6',
        password: 'user6123'
    },
    user7: {
        username: 'user7',
        password: 'user7123'
    },
    user8: {
        username: 'user8',
        password: 'user8123'
    },
    user9: {
        username: 'user9',
        password: 'user9123'
    },
    user10: {
        username: 'user10',
        password: 'user10123'
    }
};

// 导出用户数据（用于模块系统，如需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = usersContent;
}