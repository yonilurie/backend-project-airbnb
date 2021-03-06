import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRooms } from "../../store/rooms";
import SingleRoom from "./SingleRoom";
import "./RoomContainer.css"
function Rooms() {
	const dispatch = useDispatch();

	const rooms = Object.values(useSelector((state) => state.rooms));
	console.log("ROOMS", rooms);
	useEffect(() => {
		dispatch(getRooms());
	}, []);

	return (
		<div>
			<div className="rooms-container">
				{rooms &&
					rooms.map((room) => {
						return (
							<SingleRoom room={room} key={room.id}></SingleRoom>
						);
					})}
			</div>
		</div>
	);
}

export default Rooms;
