module.exports = function (sequelize, DataTypes) {
    let Model = sequelize.define('shipping_rates', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        bussnessLocationDetailId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        rate: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
    },
        {
            tableName: 'shipping_rates',
            paranoid: true
        });

    Model.associate = function (models) {
        this.bussnessLocationDetailId = this.belongsTo(models.business_location_details, { foreignKey: 'bussnessLocationDetailId' });
    };
    return Model;
};
