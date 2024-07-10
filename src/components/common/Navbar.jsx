import { useState } from "react";
import Link from "next/link";
import { PiCity } from "react-icons/pi";
import { IoClose, IoEarthOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";
import { GrUserAdmin } from "react-icons/gr";
import { GiHamburgerMenu } from "react-icons/gi";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/initFirebase";
import { useContextAPI } from "@/context/Context";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Image from 'next/image';

function Navbar({ tab }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const router = useRouter();

  const { state, dispatch } = useContextAPI();
  const user = state.user;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "SET_USER", payload: null });
      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="flex h-[70px] w-full justify-center fixed bg-[#111111] bg-opacity-80 backdrop-blur-md z-50">
        <div className="flex w-[80vw] items-center justify-between">
          <Link href={"/home"} className="flex items-center gap-2">
            <Image
              width={128}
              height={128}
              src="/logo.png"
              alt=""
              className="w-8 h-8 items-center"
            />
            <p className="text-accent text-[20px] font-bold cursor-pointer">
              <span className="text-gray-300 font-bold">SYNCITY</span>
            </p>
          </Link>

          <div className="gap-4 hidden lg:flex">
            <NavLinks tab={tab} user={user} />
          </div>

          <div className="lg:hidden">
            <button onClick={toggleMenu} className="text-text-dark text-2xl">
              {isMenuOpen ? <IoClose /> : <GiHamburgerMenu />}
            </button>
          </div>
        </div>
      </div>

      {
        <div
          className={`lg:hidden transition-all duration-200 h-[95%] p-12 ease fixed top-[70px] left-0 w-full bg-[#111111] bg-opacity-80 backdrop-blur-md z-[110] flex flex-col justify-between ${
            isMenuOpen ? "translate-y-[0%]" : "translate-y-[-150%]"
          }`}
        >
          <div className="flex flex-col items-center py-4 gap-10 ">
            <NavLinks user={user} tab={tab} />
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#ff000020] w-fit  justify-center text-text-light p-3 pl-8 pr-8 text-[15px] rounded-lg flex items-center gap-3 hover:text-white mx-auto "
          >
            Log out
          </button>
        </div>
      }
    </>
  );
}

function NavLinks({ user, tab }) {
  return (
    <>
      <Link
        href={`/home`}
        className={`flex  items-center gap-2 p-2 ${
          tab == "home" ? "text-accent" : "text-text-dark"
        }`}
      >
        <PiCity
          className={`${tab == "home" ? "text-accent" : "text-text-dark"}`}
        />
        <p>Home</p>
      </Link>
      <Link
        href={`/explore`}
        className={`flex  items-center gap-2 p-2 ${
          tab == "explore" ? "text-accent" : "text-text-dark"
        }`}
      >
        <IoEarthOutline
          className={`${tab == "explore" ? "text-accent" : "text-text-dark"}`}
        />
        <p>Explore</p>
      </Link>
      <Link
        href={`/account`}
        className={`flex  items-center gap-2 p-2 ${
          tab == "account" ? "text-accent" : "text-text-dark"
        }`}
      >
        <HiOutlineUser
          className={`${tab == "account" ? "text-accent" : "text-text-dark"}`}
        />
        <p>My Account</p>
      </Link>
      {user?.isAdmin && (
        <Link
          href={`/admin`}
          className={`flex  items-center gap-2 p-2 ${
            tab == "admin" ? "text-accent" : "text-text-dark"
          }`}
        >
          <GrUserAdmin
            className={`${tab == "admin" ? "text-accent" : "text-text-dark"}`}
          />
          <p>Admin</p>
        </Link>
      )}
    </>
  );
}

export default Navbar;
