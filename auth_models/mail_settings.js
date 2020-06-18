// mailSecuritySetting
// smtpHost
// smtUsername
// smtpPassword
// smtpPort
// smtpTimeout

module.exports = function (sequelize, DataTypes) {
    var Model = sequelize.define('mail_settings', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        mailSecuritySetting: {
            type: DataTypes.STRING(50),
            allowNull: true,
            enum: ['ssl', 'tls']
        },
        smtpHost: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        smtpUsername: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        smtpPassword: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        smtpPort: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        smtpTimeout: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },

    },
        {
            tableName: 'mail_settings',
        }
    );

    Model.prototype.toWeb = function () {
        let json = this.toJSON();
        return json;
    };

    return Model;
};
