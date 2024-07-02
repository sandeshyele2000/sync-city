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
      toast.error("Error deleting room");
    }
  };

  const fetchUserRooms = async (userId) => {
    try {
      const response = await axios.get(
        `/api/room/getUserRooms?userId=${userId}`
      );
      setUserRooms(response.data);
      console.log(response.data);
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
  }, []);


  return (
    <>
      {user ? (
        <>
          <div className="bg-background-dark w-full min-h-[100vh] h-full flex flex-col items-center overflow-auto">
            <Navbar />
            <div className="text-white w-[90vw] items-center flex h-[85vh] justify-center gap-3 mt-24 flex-col  md:flex-col lg:flex-row">
              <div className="left bg-background-cyanDark  h-full p-6 flex flex-col gap-4 items-center w-full sm:w-full md:w-full lg:w-[25%] rounded-lg">
                <img
                  src={user.profileImage}
                  className="rounded-lg border-4 border-[#0ff]  w-52 mt-8"
                />
                <div className="flex flex-col w-full items-center gap-4">
                  <p className="text">{user.username}</p>
                  <p className="text-sm">{user.nickname}</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <button
                  onClick={() => setModal(true)}
                  className="bg-background-dark w-[75%] justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto hover:bg-background-cyanLight"
                >
                  Edit profile
                </button>
                
                <CircularProgressBar value={userRooms.length} maxValue={10}/>

                <p className="text-text-dark">Rooms used</p>


                <button
                  onClick={() =>{toast.error("Delete feature is under progress!")}}
                  className="bg-[#ff000020] w-[75%] justify-center text-text-light p-3 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto "
                >
                  Delete account
                </button>
              </div>
              <div className="right bg-background-cyanDark h-full p-4 sm:w-full md:w-full ">
                <p className="text-text-dark p-3">My Rooms</p>

                <div className="flex w-full h-full flex-wrap overflow-auto min-h-[300px]  sm:justify-start justify-center">
                  {userRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex flex-col w-[250px] h-[300px] items-center justify-center p-3 bg-background-cyanDark border-[1px] border-background-cyanMedium rounded-lg m-2 hover:bg-[#08262654] hover:scale-[1.02] transition-all ease duration-200"
                    >
                      <div className="flex flex-col w-full h-full items-center justify-center">
                        <p className="text-lg">{room.name}</p>
                        <p className="text-gray-600">{room.createdAt.split('T')[0]}</p>

                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={{
                            pathname: "/room",
                            query: { id: room.id },
                          }}
                        >
                          <IoEnterOutline size={"1.5rem"} color="gray" title="Join room"/>
                        </Link>
                        <button
                          className="text-gray-700 hover:text-red-700"
                          onClick={() => deleteRoom(room.id)}
                        >
                          <IoMdTrash size={"1.5rem"} title="Delete room"/>
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
