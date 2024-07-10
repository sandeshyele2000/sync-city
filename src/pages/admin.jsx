"use client";

import Navbar from "@/components/common/Navbar";
import { useContextAPI } from "@/context/Context";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoEnterOutline } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader";
import { FaLock } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";
import {
  deleteRoomById,
  deleteUser,
  getAllRooms,
  getAllUsers,
  getUser,
} from "@/lib/api";
import { useRouter } from "next/router";
import Image from "next/image";

function AdminPage() {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const [allUsers, setAllUsers] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const loading = state.loading;
  const [displayUser, setDisplayUser] = useState(null);
  const [displayRoom, setDisplayRoom] = useState(null);
  const router = useRouter();

  const deleteRoom = async (room) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await deleteRoomById(room.id);

      const response = await getUser(room.hostId);

      let user = response.data.user;

      user.rooms = user.rooms.filter((item) => item.id !== room.id);

      setDisplayUser(user);
      setDisplayRoom(null);
      toast.success("City demolished successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error in demolishing city");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const allUsersData = await getAllUsers();
      setAllUsers(allUsersData);
      setFilteredUsers(allUsersData);
    } catch (error) {
      toast.error("Error fetching all users");
    }
  };

  const fetchAllRooms = async () => {
    try {
      const allRoomsData = await getAllRooms();
      setAllRooms(allRoomsData);
      setFilteredRooms(allRoomsData);
    } catch (error) {
      toast.error("Error fetching all rooms");
    }
  };

  const handleLoadUser = async (user) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await getUser(user.id);
      setDisplayUser(response.data.user);
      setDisplayRoom(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleLoadRoom = async (room) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await getUser(room.hostId);
      setDisplayUser(response.data.user);
      setDisplayRoom(room);
    } catch (error) {
      toast.error(error.message);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleUserSearch = (e) => {
    try {
      const query = e.target.value.toLowerCase();

      if (query.length === 0) {
        setFilteredUsers(allUsers);
        return;
      }

      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(query)
      );

      setFilteredUsers(filtered);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRoomSearch = (e) => {
    try {
      const query = e.target.value.toLowerCase();

      if (query.length === 0) {
        setFilteredRooms(allRooms);
        return;
      }

      const filtered = allRooms.filter((room) =>
        room.name.toLowerCase().includes(query)
      );

      setFilteredRooms(filtered);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      dispatch({ type: "SET_LOADING", payload: true });
      fetchAllUsers();
      fetchAllRooms();
      dispatch({ type: "SET_LOADING", payload: false });
    } else {
      if (user && !user.isAdmin) {
        router.push("/home");
      }
    }
  }, [user]);

  if (user && !user.isAdmin) {
    return null;
  }

  return (
    <>
      {user && (
        <>
          <div className="bg-background-dark w-full min-h-[100vh] h-full flex flex-col items-center overflow-auto relative">
            <Navbar tab={"admin"} />

            <Image
              width={500}
              height={500}
              src="/logo.png"
              alt=""
              className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
            />
            <div className="text-white w-[80vw] items-center flex h-[85vh] justify-center gap-3 mt-24 flex-col md:flex-row lg:flex-row relative">
              <div className="left bg-[#0b0b0b] border border-[#1e1e1e] h-full flex flex-col gap-2 items-center w-full sm:w-full md:w-full lg:w-[28%] rounded-lg bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg overflow-hidden">
                <input
                  type="text"
                  name="userSearch"
                  id="userSearch"
                  placeholder="Search User..."
                  onChange={handleUserSearch}
                  className="flex w-full p-3 h-[50px] bg-transparent outline-none border-b-[#1e1e1e] border-b-[1px]"
                />
                <div className="overflow-y-auto flex flex-col gap-2 items-center w-full sm:w-full md:w-full lg:w-full min-h-[40%]">
                  {filteredUsers.length > 0 &&
                    filteredUsers.map((userItem) => (
                      <div
                        key={userItem.id}
                        className="flex items-center cursor-pointer w-[90%] justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e] rounded-lg m-2 hover:bg-[#08262654]"
                        onClick={() => handleLoadUser(userItem)}
                      >
                        {userItem.username}
                      </div>
                    ))}
                </div>

                <input
                  type="text"
                  name="roomSearch"
                  id="roomSearch"
                  placeholder="Search City..."
                  onChange={handleRoomSearch}
                  className="flex w-full p-3 h-[50px] bg-transparent outline-none border-b-[#1e1e1e] border-b-[1px]"
                />
                <div className="overflow-y-auto flex flex-col gap-2 items-center w-full sm:w-full md:w-full lg:w-full">
                  {filteredRooms.length > 0 &&
                    filteredRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center cursor-pointer w-[90%] justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e] rounded-lg m-2 hover:bg-[#08262654]"
                        onClick={() => handleLoadRoom(room)}
                      >
                        {room.name}
                      </div>
                    ))}
                </div>
              </div>
              <div className="right flex bg-[#0b0b0b] border gap-3 border-[#1e1e1e] rounded-lg h-full p-4 w-full sm:w-full md:w-full flex-col lg:flex-row lg:w-[92%] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg overflow-hidden overflow-y-auto">
                <div className="flex flex-col w-[50%] border-[#1e1e1e] border rounded-lg p-4 sm:w-full">
                  {displayUser ? (
                    <>
                      <div className="flex flex-col gap-3 p-3 ">
                        <div className="flex flex-col items-center">
                          <Image
                            width={500}
                            height={500}
                            src={displayUser.profileImage}
                            alt=""
                            className="rounded-lg border border-[#0ff] w-[13rem] h-[13rem]"
                          />
                          <div className="flex flex-col p-4 items-center justify-center">
                            <p className="font-extrabold">
                              {displayUser.username}
                            </p>
                            <p className="text-text-dark">
                              {displayUser.nickname}
                            </p>
                            <p className="text-text-dark">
                              {displayUser.email}
                            </p>
                            <div className="flex gap-2 text-text-dark">
                              Cities Built:{" "}
                              <div>{displayUser.rooms.length}</div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteUser(displayUser.id)}
                          className="bg-[#ff000020] w-full justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto"
                        >
                          Delete account
                        </button>
                      </div>

                      <p className="mt-4">User Cities</p>
                      <div className="flex flex-col overflow-y-auto items-center mt-3">
                        {displayUser.rooms.map((roomItem) => (
                          <div
                            key={roomItem.id}
                            className="flex items-center cursor-pointer w-[90%] justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e] rounded-lg m-2 hover:bg-[#08262654]"
                            onClick={() => handleLoadRoom(roomItem)}
                          >
                            <p>{roomItem.name}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 items-center justify-center text-text-dark h-full">
                        <p>Select a User to display</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col w-[50%] border-[#1e1e1e] border rounded-lg p-4 sm:w-full">
                  {displayRoom ? (
                    <>
                      <div
                        key={displayRoom.id}
                        className="flex flex-col w-full h-full  justify-center p-3 bg-[#0941413a] border-[1px] border-background-cyanMedium rounded-lg m-2 hover:bg-[#08262654]"
                      >
                        <div className="flex flex-col w-full h-full items-center justify-center gap-5">
                          <p className="text-lg">{displayRoom.name}</p>
                          <p className="text-gray-600">
                            Built on {displayRoom.createdAt.split("T")[0]}
                          </p>
                          {displayRoom.isPrivate ? (
                            <FaLock size={"20px"} />
                          ) : (
                            <MdOutlinePublic size="25px" />
                          )}
                          <p className="text-gray-600">
                            {displayRoom.isPrivate ? "Private" : "Public"}
                          </p>
                        </div>

                        <div className="flex gap-2 w-full justify-between flex-col">
                          <Link
                            href={{
                              pathname: "/city",
                              query: { id: displayRoom.id },
                            }}
                            className="flex gap-2 border border-[#1f444b] p-2 rounded-lg"
                          >
                            <IoEnterOutline
                              size={"1.5rem"}
                              color="gray"
                              title="Enter city"
                            />

                            <p> Enter City</p>
                          </Link>
                          <button
                            className="text-gray-700 hover:text-red-700 flex gap-2 border border-[#1f444b] p-2 rounded-lg"
                            onClick={() => deleteRoom(displayRoom)}
                          >
                            <IoMdTrash size={"1.5rem"} title="Delete room" />
                            <p> Demolish City</p>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 items-center justify-center h-full text-text-dark">
                        <p>Select a city to display</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {loading && (
              <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px] translate-y-[5%]">
                <Loader size={"100px"} />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default AdminPage;
