"use client";

import Navbar from "@/components/common/Navbar";
import { useContextAPI } from "@/context/Context";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoEnterOutline } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/router";
import ModalForm from "@/components/common/ModalForm";
import CircularProgressBar from "@/components/common/CircularProgressBar";
import Loader from "@/components/common/Loader";
import { ROOM_LIMIT } from "@/lib/constants";
import { FaLock } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";
import { deleteRoomById, getUserRooms } from "@/lib/api";

function AccountPage() {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const [userRooms, setUserRooms] = useState([]);
  const router = useRouter();
  const loading = state.loading;
  const [modal, setModal] = useState(false);

  const deleteRoom = async (roomId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await deleteRoomById(roomId);
      setUserRooms((prev) => prev.filter((item) => item.id !== roomId));
      toast.success("City demolished successfully!");
    } catch (error) {
      toast.error("Error in demolishing city");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchUserRooms = async (userId) => {
    try {
      const userRoomsData = await getUserRooms(userId);
      setUserRooms(userRoomsData);
      dispatch({ type: "SET_USER_ROOMS", payload: userRoomsData });
    } catch (error) {
      toast.error("Error fetching your cities");
    }
  };

  useEffect(() => {
    if (user) {
      dispatch({ type: "SET_LOADING", payload: true });
      fetchUserRooms(user.id);
      dispatch({ type: "SET_LOADING", payload: false });
    } else {
      router.push("/login");
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
            <div className="text-white w-[80vw] items-center flex h-[85vh] justify-center gap-3 mt-24 flex-col  md:flex-row lg:flex-row relative">
              <div className="left bg-[#0b0b0b] border border-[#1e1e1e]  h-full p-6 flex flex-col gap-8 items-center w-full sm:w-full md:w-full md:flex-col lg:w-[28%] lg:flex-col rounded-lg bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg overflow-y-auto">
                <div className="flex flex-col items-center justify-center gap-6">
                  <img
                    src={user.profileImage}
                    className="rounded-lg border border-[#0ff]  w-56 mt-8 md:w-40"
                  />
                  <div className="flex flex-col w-full items-center gap-2">
                    <p className="text-[1.4rem]">{user.username}</p>
                    <p className="text-sm text-gray-400">{user.nickname}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setModal(true)}
                    className="bg-background-dark border-[#1e1e1e] border w-[75%] justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto hover:bg-background-cyanLight "
                  >
                    Edit profile
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <CircularProgressBar
                      value={userRooms?.length}
                      maxValue={ROOM_LIMIT}
                    />
                    <p className="text-text-dark">Cities Built</p>
                  </div>

                  <button
                    onClick={() => {
                      toast.error("Delete feature is under progress!");
                    }}
                    className="bg-[#ff000020] w-fit justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto "
                  >
                    Delete account
                  </button>
                </div>
              </div>
              <div className="right  bg-[#0b0b0b] border border-[#1e1e1e] rounded-lg h-full p-4 w-full sm:w-full md:w-full lg:w-[72%] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg overflow-hidden">
                <p className="text-text-dark p-3">My Cities</p>

                <div className="flex w-full h-full flex-wrap overflow-auto min-h-[300px]  sm:justify-start justify-center">
                  {userRooms?.length > 0 ? (
                    userRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex flex-col w-[250px] h-[300px]  justify-center p-3 bg-[#0941413a] border-[1px] border-background-cyanMedium rounded-lg m-2 hover:bg-[#08262654]"
                      >
                        <div className="flex flex-col w-full h-full items-center justify-center gap-5">
                          <p className="text-lg">{room.name}</p>
                          <p className="text-gray-600">
                            Built on {room.createdAt.split("T")[0]}
                          </p>
                          {room.isPrivate ? <FaLock size={"20px"} /> : <MdOutlinePublic size="25px" />}
                          <p className="text-gray-600">
                            {room.isPrivate ? "Private" : "Public"}
                          </p>
                        </div>

                        <div className="flex gap-2 w-full justify-between flex-col">
                          <Link
                            href={{
                              pathname: "/city",
                              query: { id: room.id },
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
                            onClick={() => deleteRoom(room.id)}
                          >
                            <IoMdTrash size={"1.5rem"} title="Delete room" />
                            <p> Demolish City</p>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex w-full h-full items-center justify-center">
                      <Link href={{ pathname: "/dashboard" }}>
                        Build your city now!
                      </Link>
                    </div>
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
          <ModalForm
            isOpen={modal}
            user={user}
            onClose={() => setModal(false)}
          />
        </>
      )}
    </>
  );
}

export default AccountPage;
