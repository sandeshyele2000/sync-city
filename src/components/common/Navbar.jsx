import React, { useState } from "react";
import { useContextAPI } from "../../context/Context";
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from "react-icons/md";
import toast from "react-hot-toast";
import { auth } from "../../firebase/initFirebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";

function Navbar() {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const router = useRouter();
  const [dropDown, setDropDown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "SET_USER", payload: null });
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[70px] w-full justify-center fixed bg-[#111111] bg-opacity-80 backdrop-blur-md z-50">
      <div className="flex w-[80vw] items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="./logo.png" alt="" className="w-8 h-8 items-center" />
          <p className="text-accent text-[20px] font-bold cursor-pointer">
            Sync <span className="text-white">City</span>
          </p>
        </div>

        <div
          className="flex gap-2 items-center cursor-pointer border-[#1e1e1e] border-[1px] p-2 rounded-[30px] "
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
          <p className="text-text-dark hover:text-text-light">
            {user.username.toLowerCase()}
          </p>
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
        <div
          className="flex absolute gap-4 bg-background rounded-lg flex-col p-5 right-[10vw] top-[80px] items-center justify-center"
          id="dropdown"
        >
          <Link
            href={`/account`}
            className="text-text-dark cursor-pointer hover:text-text-light"
          >
            My Account
          </Link>
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
