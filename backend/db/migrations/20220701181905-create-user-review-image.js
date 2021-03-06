"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("UserReviewImages", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			reviewId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "Reviews" },
				onDelete: "CASCADE",
			},
			userId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "Users" },
				onDelete: "CASCADE",
			},
			imageUrl: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("UserReviewImages");
	},
};
