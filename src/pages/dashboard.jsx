"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdTrash } from "react-icons/io";
import Link from "next/link";
import Navbar from "../components/common/Navbar";
import Notification from "@/components/common/Notification";
import { useContextAPI } from "../context/Context";
import { useRouter } from "next/router";
import { IoEnterOutline } from "react-icons/io5";

const DashBoardPage = () => {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const rooms = state.allRooms;
  const router = useRouter();
  const [userRooms, setUserRooms] = useState([]);
  const loading = state.loading;

  const createRoom = async (roomName, hostId) => {
    try {
      const response = await axios.post("/api/room/createRoom", {
        roomName,
        hostId,
      });
      return response.data.room;
    } catch (error) {
      console.error(error);
      toast.error("Error creating room");
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      const response = await axios.delete("/api/room/deleteRoom", {
        data: roomId,
      });
      return response.data;
    } catch (error) {
      toast.error(error);
    }
  };

  const getAllRooms = async () => {
    try {
      const response = await axios.get("/api/room/getAllRooms");
      return response.data.rooms;
    } catch (error) {
      toast.error("Error fetching rooms");
    }
  };

  const getUserRooms = async (userId) => {
    try {
      const response = await axios.get(
        `/api/room/getUserRooms?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      toast.error("Error fetching rooms");
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const roomName = e.target.roomName.value;
    e.target.roomName.value = "";
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newRoom = await createRoom(roomName, user.id);
      if (newRoom) {
        setUserRooms((prev) => [...prev, newRoom]);
        toast.success("Room created successfully!");
      }
    } catch (error) {
      toast.error("Error creating room");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await deleteRoom(roomId);
      setUserRooms((prev) => prev.filter((item) => item.id != roomId));
      toast.success("Room deleted successfully!");
    } catch (error) {
      toast.error(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: true });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const userRoomsData = await getUserRooms(user.id);
      const data = await getAllRooms();
      setUserRooms(userRoomsData);
      dispatch({ type: "SET_ALL_ROOMS", payload: data });
      dispatch({ type: "SET_LOADING", payload: false });
    };
    fetchData();
  }, []);


  if(!user){
     router.push('/login')
  }

  return (
    <>
      {user && (
        <div className="bg-background-dark w-full min-h-[100vh] flex flex-col items-center">
          <Navbar />
          <div className="text-white w-[80vw] items-center flex h-full flex-col justify-center gap-10">
            <div className="flex gap-2 text-[35px] mt-32">
              <span>Welcome, </span>
              <span className="text-accent">
                {user ? user.username : "Guest"}
              </span>
            </div>

            <div className="flex w-[90%] gap-4 flex-col lg:flex-row md:flex-col sm:flex-col">
              <div className="flex flex-col w-full hover:border-accent border-[1px] border-background-cyanMedium bg-background-cyanDark rounded-lg p-4 h-[500px]">
                <p className="text-text-dark p-3">My Rooms</p>
                <div className="flex h-[80%] w-full flex-col gap-3 overflow-auto">
                  {userRooms?.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 bg-background-cyanDark border-[1px] border-background-cyanMedium  rounded-lg m-2 hover:bg-[#08262654]"
                    >
                      <p>{room.name}</p>
                      <div className="flex gap-2">
                        <Link
                          href={{
                            pathname: "/room",
                            query: { id: room.id },
                          }}
                        >
                          <IoEnterOutline size={"1.5rem"} color="gray" />
                        </Link>
                        <button
                          className="text-gray-700 hover:text-red-700"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <IoMdTrash size={"1.5rem"} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  method="post"
                  className="flex gap-2 h-[50px] justify-center w-full items-center mt-3"
                  onSubmit={handleCreateRoom}
                >
                  <input
                    type="text"
                    name="roomName"
                    id="roomName"
                    placeholder="Enter Room Name"
                    className="flex w-[85%] p-3 h-full rounded-lg bg-[transparent] outline-none border-[1px] border-background-cyanMedium"
                  />
                  <button
                    className={`bg-accent text-black h-full pr-2 pl-2 text-[15px] rounded-lg flex items-center gap-3 hover:shadow-[0px_0px_2px_#0ff] ${
                      user.rooms.length > 9 ? "bg-gray-700" : ""
                    }`}
                    disabled={user.rooms.length > 9}
                  >
                    Create
                  </button>
                </form>
              </div>

              <div className="flex flex-col w-full hover:border-accent border-[1px] border-background-cyanMedium rounded-lg p-4 h-[500px] bg-background-cyanDark">
                <p className="text-text-dark p-3">Public Rooms</p>
                <div className="flex flex-col gap-3 overflow-auto">
                  {rooms.length > 0 &&
                    rooms
                      .filter((room) => room.hostId != user.id)
                      .map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-3 bg-background-cyanDark border-[1px] border-background-cyanMedium  rounded-lg m-2 hover:bg-[#08262654]"
                        >
                          <p>{room.name}</p>
                          <div className="flex gap-2">
                            <Link
                              href={{
                                pathname: "/room",
                                query: { id: room.id },
                              }}
                            >
                              <IoEnterOutline size={"1.5rem"} color="gray" />
                            </Link>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Notification />
    </>
  );
};

export default DashBoardPage;
