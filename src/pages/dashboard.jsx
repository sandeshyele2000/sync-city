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
import Loader from "@/components/common/Loader";

const DashBoardPage = () => {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const rooms = state.allRooms;
  const router = useRouter();
  const [userRooms, setUserRooms] = useState([]);
  const loading = state.loading;
  const roomLimit = 10;
  console.log(roomLimit);

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
    if(userRooms.length>=10){
      return toast.error('Reached your build limit!')
    }
    const roomName = e.target.roomName.value;
    e.target.roomName.value = "";
  
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newRoom = await createRoom(roomName, user.id);
      if (newRoom) {
        setUserRooms((prev) => [...prev, newRoom]);
        toast.success("City built successfully!");
      }
    } catch (error) {
      toast.error("Error building city");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await deleteRoom(roomId);
      setUserRooms((prev) => prev.filter((item) => item.id != roomId));
      toast.success("City demolished successfully!");
    } catch (error) {
      toast.error(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const userRoomsData = await getUserRooms(user.id);
        const data = await getAllRooms();
        setUserRooms(userRoomsData);
        dispatch({ type: "SET_ALL_ROOMS", payload: data });
      } catch (error) {
        toast.error(error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    if (!user) {
      router.push("/login");
    } else {
      fetchData();
    }
  }, []);

  return (
    <>
      <div className="bg-background-dark w-full min-h-[100vh] flex flex-col items-center relative overflow-hidden">
        <Navbar />
        <img
          src="./logo.png"
          alt=""
          className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
        />
        {user && (
          <div
            className={`text-white w-[80vw] items-center flex h-full flex-col justify-center gap-5 relative`}
          >
            <div className="flex gap-2 text-[35px] mt-32">
              <span>Welcome, </span>
              <span className="text-accent">
                {user ? user.username : "Guest"}
              </span>
            </div>

            <p className="text-text-dark text-[22px] opacity-70 text-center">
              Enter into your favorite city and start{" "}
              <span className="text-accent">Syncing!</span>{" "}
            </p>

            <div className="flex w-[90%] gap-4 flex-col lg:flex-row md:flex-col sm:flex-col">
              <div className="flex flex-col w-full hover:border-accent border-[1px] border-[#1e1e1e] bg-[#000000] rounded-lg p-4 h-[500px] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg">
                <p className="text-text-dark p-3">My Cities</p>
                <div className="flex h-[80%] w-full flex-col gap-3 overflow-auto">
                  {userRooms?.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e]  rounded-lg m-2 hover:bg-[#08262654]"
                    >
                      <p>{room.name}</p>
                      <div className="flex gap-2">
                        <Link
                          href={{
                            pathname: "/room",
                            query: { id: room.id },
                          }}
                        >
                          <IoEnterOutline
                            size={"1.5rem"}
                            color="gray"
                            title="Join room"
                          />
                        </Link>
                        <button
                          className="text-gray-700 hover:text-red-700"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <IoMdTrash size={"1.5rem"} title="Delete room" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  method="post"
                  className="flex h-[50px] justify-between w-full items-center mt-3 border-[1px] border-[#1e1e1e] p-2 rounded-[30px]"
                  onSubmit={handleCreateRoom}
                >
                  <input
                    type="text"
                    name="roomName"
                    id="roomName"
                    placeholder="Enter City Name"
                    className="flex w-[85%] p-3 h-full rounded-lg bg-[transparent] outline-none "
                  />
                  <button
                    className={` text-white h-full pr-2 pl-2 text-[15px] flex items-center gap-3   border-l-[1px] border-[#1e1e1e] ${
                      userRooms.length >= roomLimit
                        ? "text-gray-500"
                        : "hover:text-accent"
                    }`}
                  >
                    Build
                  </button>
                </form>
              </div>

              <div className="flex flex-col w-full hover:border-accent border-[1px] border-[#1e1e1e] rounded-lg p-4 h-[500px] bg-[#0b0b0b] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg">
                <p className="text-text-dark p-3">Explore other Cities</p>
                <div className="flex flex-col gap-3 overflow-auto">
                  {rooms.length > 0 &&
                    rooms
                      .filter((room) => room.hostId != user.id)
                      .map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e]  rounded-lg m-2 hover:bg-[#08262654]"
                        >
                          <p>{room.name}</p>
                          <div className="flex gap-2">
                            <Link
                              href={{
                                pathname: "/room",
                                query: { id: room.id },
                              }}
                            >
                              <IoEnterOutline
                                size={"1.5rem"}
                                color="gray"
                                title="Join room"
                              />
                            </Link>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px]">
            <Loader size={"100px"} />
          </div> 
        )}
      </div>

      <Notification />
    </>
  );
};

export default DashBoardPage;
