"use client";

import Navbar from "@/components/common/Navbar";
import { useContextAPI } from "@/context/Context";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoEnterOutline } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Loader from "@/components/common/Loader";
import { FaLock } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";
import { deleteRoomById, getAllUsers } from "@/lib/api";

function AdminPage() {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const router = useRouter();
  const loading = state.loading;
  const [displayUser, setDisplayUser] = useState(null);
  const [displayRoom, setDisplayRoom] = useState(null);

  const deleteRoom = async (roomId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await deleteRoomById(roomId)
      setAll((prev) => prev.filter((item) => item.id !== roomId));
      toast.success("City demolished successfully!");
    } catch (error) {
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
      console.log(allUsersData);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching your all users");
    }
  };

  const handleUserSearch = (e) => {
    try {
      let query = e.target.value;

      if (query.length == 0) {
        setFilteredUsers(allUsers);
        return;
      }

      let temp = [...filteredUsers];

      temp = temp.filter((user) => {
        if (user.username.toLowerCase().includes(query)) return user;
      });

      setFilteredUsers(temp);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      dispatch({ type: "SET_LOADING", payload: true });
      fetchAllUsers();
      console.log(user);
      dispatch({ type: "SET_LOADING", payload: false });
    } else {
      router.push("/dashboard");
    }
  }, []);

  return (
    <>
      {user && (
        <>
          <div className="bg-background-dark w-full min-h-[100vh] h-full flex flex-col items-center overflow-auto relative">
            <Navbar />
            <img
              src="./logo.png"
              alt=""
              className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
            />
            {console.log(displayUser)}
            <div className="text-white w-[80vw] items-center flex h-[85vh] justify-center gap-3 mt-24 flex-col  md:flex-row lg:flex-row relative">
              <div className="left bg-[#0b0b0b] border border-[#1e1e1e]  h-full  flex flex-col gap-2 items-center w-full sm:w-full md:w-full md:flex-col lg:w-[28%] lg:flex-col rounded-lg bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg overflow-y-auto">
                <input
                  type="text"
                  name="userSearch"
                  id="userSearch"
                  placeholder="Search User..."
                  onChange={(e) => handleUserSearch(e)}
                  className="flex w-full p-3 h-[50px]  bg-transparent outline-none border-b-[#1e1e1e] border-b-[1px]"
                />
                {filteredUsers.length > 0 &&
                  filteredUsers.map((userItem) => (
                    <div
                      key={userItem.id}
                      className="flex items-center cursor-pointer w-[90%] justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e]  rounded-lg m-2 hover:bg-[#08262654]"
                      onClick={() => {
                        setDisplayUser(userItem);
                        setDisplayRoom(null);
                      }}
                    >
                      {userItem.username}
                    </div>
                  ))}
              </div>
              <div className="right  flex  bg-[#0b0b0b] border gap-3 border-[#1e1e1e] rounded-lg h-full p-4 w-full sm:w-full md:w-full lg:w-[92%] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg overflow-hidden">
                <div className="flex flex-col w-[40%]">
                  {displayUser && (
                    <>
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <img
                            src={displayUser.profileImage}
                            alt=""
                            className="rounded-lg border border-[#0ff]  w-[100px] h-[100px]"
                          />
                          <div className="flex flex-col p-4">
                            <p className="font-extrabold">
                              {displayUser.username}
                            </p>
                            <p>{displayUser.nickname}</p>
                            <p>{displayUser.email}</p>
                            <div className="flex gap-2">
                              Cities Built:{" "}
                              <div>{displayUser.rooms.length}</div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            toast.error("Delete feature is under progress!");
                          }}
                          className="bg-[#ff000020] w-full justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto "
                        >
                          Delete account
                        </button>
                      </div>

                      <p className="mt-4">User Cities</p>
                      <div className="flex flex-col overflow-y-auto items-center mt-3">
                        {displayUser.rooms.map((roomItem) => (
                          <div
                            key={roomItem.id}
                            className="flex items-center cursor-pointer w-[90%] justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e]  rounded-lg m-2 hover:bg-[#08262654]"
                            onClick={() => {
                              setDisplayRoom(roomItem);
                            }}
                          >
                            {roomItem.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex w-[60%] flex-col">
                  {displayRoom && (
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
                          {displayRoom.isPrivate ? <FaLock size={"20px"} /> : <MdOutlinePublic size="25px" />}
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
                            onClick={() => deleteRoom(displayRoom.id)}
                          >
                            <IoMdTrash size={"1.5rem"} title="Delete room" />
                            <p> Demolish City</p>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px]">
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
