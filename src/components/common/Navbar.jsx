import React, { useState } from "react";
import { useContextAPI } from "../../context/Context";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import toast from "react-hot-toast";
import {auth} from "../../firebase/initFirebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

function Navbar() {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const router = useRouter();

  console.log(user)
  const [dropDown, setDropDown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "SET_USER", payload: null });
      toast.success('Logged out successfully!')
      router.push('/login')

    } catch (error) {
      console.log(error)
      toast.error(error.message);
    }
    
  };

  if (!user) return null; // Return null if there's no user

  return (
    <div className="flex h-[70px] w-full justify-center fixed bg-gray-400 bg-opacity-10 backdrop-blur-md z-50">
      <div className="flex w-[75vw] items-center justify-between">
        <p className="text-accent text-[25px] font-bold cursor-pointer">
          Sync City
        </p>
        <div
          className="flex gap-2 items-center cursor-pointer border-background-light border-[1px] p-2 rounded-[30px] "
          onClick={() => setDropDown(!dropDown)}
        >
          <img
            src={
              user.profileImage ||
              `https://beforeigosolutions.com/wp-content/uploads/2021/12/dummy-profile-pic-300x300-1.png`
            }
            alt="user profile"
            className="rounded-full w-8 h-8"
          />
          <p className="text-text-dark hover:text-text-light">{user.username.toLowerCase()}</p>
          {!dropDown ? (
            <MdOutlineArrowDropDown
              size={"1.2rem"}
              color="white"
              className="cursor-pointer"
            />
          ) : (
            <MdOutlineArrowDropUp
              size={"1.2rem"}
              color="white"
              className="cursor-pointer"
            />
          )}
        </div>
      </div>

      {dropDown && (
        <div className="flex absolute gap-4 bg-background rounded-lg flex-col p-5 right-[13vw] top-[80px] items-center justify-center" id="dropdown">
          <p className="text-text-dark cursor-pointer hover:text-text-light">My Account</p>
          <p
            className="text-text-dark cursor-pointer hover:text-text-light"
            onClick={handleLogout}
          >
            Log out
          </p>
        </div>
      )}
    </div>
  );
}

export default Navbar;