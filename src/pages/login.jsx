import { FcGoogle } from "react-icons/fc";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/router";
import { useContextAPI } from "../context/Context";
import toast from "react-hot-toast";
import { auth } from "../firebase/initFirebase";
import axios from "axios";

function LoginPage() {
  const { state, dispatch } = useContextAPI();
  const userData = state.user;
  const router = useRouter();

  const registerUser = async ({
    email,
    firebaseId,
    username,
    profileImage,
  }) => {
    try {
      const response = await axios.post("/api/auth/registerUser", {
        email,
        firebaseId,
        username,
        profileImage,
      });
      return response.data;
    } catch (error) {
      toast.error(error);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const { user } = await signInWithPopup(auth, provider);

      const response = await registerUser({
        email: user.email,
        firebaseId: user.uid,
        username: user.displayName,
        profileImage: user.photoURL,
      });

      dispatch({
        type: "SET_USER",
        payload: response.user,
      });

    } catch (error) {
      toast.error(`Error signing in with Google: ${error.message}`);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  if(userData){
     router.push('/dashboard')
  }

  return (
    <>
      <div className="bg-background-dark w-full h-[100vh] flex justify-center items-center overflow-hidden relative">
        <div className="absolute rounded-full w-[800px] h-[800px] border-[1px] border-[#0ff] opacity-40 z-0 animate-pulse bg-opacity-10 backdrop-blur-md bg-[#0ff]"></div>
        <div className="absolute rounded-full w-[1000px] h-[1000px] border-[1px] border-[#0ff] opacity-30 bg-opacity-10 backdrop-blur-md bg-[#0ff] animate-pulse"></div>
        <div className="absolute rounded-full w-[1400px] h-[1400px] border-[1px] border-[#0ff] opacity-20 bg-opacity-10 backdrop-blur-md bg-[#0ff] animate-pulse"></div>
        <div className="absolute rounded-full w-[1700px] h-[1700px] border-[1px] border-[#0ff] opacity-10 bg-opacity-10 backdrop-blur-md bg-[#0ff] animate-pulse"></div>

        <div className="z-10  flex w-[650px] h-[650px] items-center justify-center flex-col gap-8 relative rounded-full border-[1px] border-accent shadow-[0px_0px_55px_#006f6f] m-5 outline-double outline-[5px] outline-[#0ff] bg-opacity-90 backdrop-blur-md bg-[#00000081]">
          <h1 className="text-accent text-center font-bold text-[35px] sm:text-[45px] md:text-[50px] lg:text-[70px] rounded-lg hover:text-background-dark text-outline cursor-pointer ">
            Sync City
          </h1>
          <hr className="w-full  border-[1px] border-accent" />
          <p className="text-accent pl-5 pr-5 text-center opacity-50 text-[12px]  sm:text-[12px] md:text-[15px] lg:text-[20px]">
            Watch videos and chat with your friends in realtime!
          </p>

          <button
            className="pt-3 pb-3 pr-4 pl-4  text-accent text-[12px] sm:text-[12px] md:text-[15px] lg:text-[20px] rounded-[35px] border-[1px] border-background-light flex items-center gap-3 shadow-[0px_0px_5px_#0ff] hover:bg-[rgba(0,0,0,0.3)]"
            onClick={handleLogin}
          >
            <FcGoogle />
            Login with Google
          </button>
        </div>
      </div>
    </>
  );
}

export default LoginPage;