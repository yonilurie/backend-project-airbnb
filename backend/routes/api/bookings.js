const express = require("express");
const { requireAuth, restoreUser } = require("../../utils/auth");
const { Booking, Room } = require("../../db/models");
const { check } = require("express-validator");
const { Op } = require("sequelize");
const router = express.Router();

//Checks if booking has required infos
const validateBooking = [
	check("startDate")
		.exists()
		.notEmpty()
		.withMessage("Must provide start date"),
	check("endDate").exists().notEmpty().withMessage("Must provide end date"),
];

//Edit a booking
router.put(
	"/:bookingId",
	[validateBooking, restoreUser, requireAuth],
	async (req, res) => {
		const { bookingId } = req.params;
		const { id } = req.user;
		let { startDate, endDate } = req.body;
		//Convert dates to date objects
		startDate = startDate.split("-");
		startDate[1] -= 1;
		startDate = new Date(startDate[0], startDate[1], startDate[2]);
		endDate = endDate.split("-");
		endDate[1] -= 1;
		endDate = new Date(endDate[0], endDate[1], endDate[2]);
		//check if dates are valid
		if (startDate >= endDate) {
			res.status = 403;
			return res.json({
				message: "Start date cant be after or on end date ",
			});
		}
		//Check if the booking exists
		let existingBooking = await Booking.findByPk(bookingId);
		if (!existingBooking) {
			res.status = 404;
			return res.json({
				message: "Booking couldn't be found",
				statusCode: 404,
			});
		}
		if (existingBooking.userId !== id) {
			return res.json({
				message: "Can only edit your own reviews",
			});
		}
		//Create current time object
		let now = new Date();
		let currentTime = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate()
		);
		console.log(currentTime, "CURRENT");
		console.log(existingBooking.startDate, "BOOKING");
		console.log(startDate);
		//Check if booking the user want to edit has already passed
		if (
			currentTime >= existingBooking.startDate ||
			currentTime >= startDate
		) {
			res.status = 400;
			return res.json({
				message: "Past bookings can't be modified",
				statusCode: 400,
			});
		}

		//Check if any booking occur in between the given start and end timess
		let checkAvailability = await Booking.findOne({
			where: {
				startDate: { [Op.gte]: startDate },
				endDate: { [Op.lte]: endDate },
			},
		});

		//if room is not available return error with 403 code
		if (checkAvailability) {
			res.status = 403;
			return res.json({
				message:
					"Sorry, this room is already booked for the specified dates",
				statusCode: 403,
				errors: {
					startDate: "Start date conflicts with an existing booking",
					endDate: "End date conflicts with an existing booking",
				},
			});
		}

		existingBooking.startDate = startDate;
		existingBooking.endDate = endDate;
		await existingBooking.save();
		return res.json(existingBooking);
	}
);

//Delete a booking
router.delete("/:bookingId", [restoreUser, requireAuth], async (req, res) => {
	const { bookingId } = req.params;
	const { id } = req.user;
	//Find the booking
	let booking = await Booking.findByPk(bookingId);
	//If booking not found return 404 code and message
	if (!booking) {
		res.status = 404;
		return res.json({
			message: "Booking couldn't be found",
			statusCode: 404,
		});
	}
	//Check if booking belongs oto the user
	if (booking.userId !== id) {
		res.status = 404;
		return res.json({
			message: "Booking couldn't be found",
			statusCode: 404,
		});
	}

	//Delete booking and return success message
	booking.destroy();
	return res.json({
		message: "Successfully deleted",
		statusCode: 200,
	});
});

//get all of a users bookings
router.get("/", [restoreUser, requireAuth], async (req, res) => {
	const { id } = req.user;
	//Find all bookings belonging to the user, as well as room details
	let bookings = await Booking.findAll({
		where: { userId: id },
		include: {
			model: Room,
			attributes: [
				"id",
				"ownerId",
				"address",
				"city",
				"state",
				"country",
				"lat",
				"lng",
				"name",
				"price",
				"previewImage",
			],
		},
	});
	//If there are no bookings return 200 code and message
	if (!bookings.length) {
		res.status = 200;
		return res.json({
			message: "No bookings yet",
		});
	}

	res.status = 200;
	return res.json(bookings);
});
module.exports = router;
