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

function AccountPage() {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const [userRooms, setUserRooms] = useState([]);
  const router = useRouter();
  const [modal, setModal] = useState(false);

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete("/api/room/deleteRoom", {
        data: roomId,
      });
      setUserRooms((prev) => prev.filter((item) => item.id !== roomId));
      toast.success("Room deleted successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error deleting room");
    }
  };

  const fetchUserRooms = async (userId) => {
    try {
      const response = await axios.get(
        `/api/room/getUserRooms?userId=${userId}`
      );
      setUserRooms(response.data);
      dispatch({ type: "SET_USER_ROOMS", payload: response.data });
    } catch (error) {
      toast.error("Error fetching rooms");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserRooms(user.id);
    } else {
      router.push("/login");
    }
  }, [user]);

  return (
    <>
      {user ? (
        <>
          <div className="bg-background-dark w-full min-h-[100vh] flex flex-col items-center">
            <Navbar />
            <div className="text-white w-[90vw] items-center flex h-[85vh] justify-center gap-3 mt-24 flex-col  md:flex-col lg:flex-row">
              <div className="left bg-background-cyanDark  h-full p-4 flex flex-col gap-4 items-center w-full sm:w-full md:w-full lg:w-[20%]">
                <img
                  src={user.profileImage}
                  alt=""
                  className="rounded-lg border-4 border-[#0ff] h-52 w-52"
                />
                <div className="flex flex-col w-full items-center gap-4">
                  <p className="text">{user.username}</p>
                  <p className="text-sm">{user.nickname}</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <button
                  onClick={() => setModal(true)}
                  className="bg-background-cyanDark w-[80%] justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto hover:bg-background-dark"
                >
                  Edit profile
                </button>
                <p>Active Rooms: {userRooms.length}</p>
              </div>
              <div className="right bg-background-cyanDark h-full p-4 sm:w-full md:w-full overflow-hidden">
                <p className="text-text-dark">Your Rooms</p>

                <div className="flex w-full h-full flex-wrap overflow-auto">
                  {userRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex flex-col w-[250px] h-[300px] items-center justify-center p-3 bg-background-cyanDark border-[1px] border-background-cyanMedium rounded-lg m-2 hover:bg-[#08262654]"
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
                          onClick={() => deleteRoom(room.id)}
                        >
                          <IoMdTrash size={"1.5rem"} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ModalForm
            isOpen={modal}
            user={user}
            onClose={() => setModal(false)}
          />
        </>
      ) : (
        <> Loading...</>
      )}
    </>
  );
}

export default AccountPage;
