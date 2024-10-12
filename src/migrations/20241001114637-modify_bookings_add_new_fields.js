'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(
      'Bookings',
      'noOfSeats',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    );
    await queryInterface.addColumn(
      'Bookings',
      'totalCost',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    );
    await queryInterface.addColumn(
      'Bookings',
      'bookingDate',
      {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date()
      }

    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Booking', 'noOfSeats'); //If we revert the changes i.e. db:migrate:undo, then only these two columns will be removed
    await queryInterface.removeColumn('Booking', 'totalCost');
  }
};
