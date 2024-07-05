import React, { useState } from "react";
import toast from 'react-hot-toast'
import axios from 'axios'
import { useContextAPI } from "@/context/Context";
import { updateUserDetails } from "@/lib/api";

function ModalForm({ isOpen, onClose, user }) {
  const {state,dispatch} = useContextAPI();
  const [formData, setFormData] = useState({
    username: user.username,
    nickname: user.nickname,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserDetails(formData,user.email);      
      dispatch({type:'SET_USER',payload: response});

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 text-text-light">
      <div className="bg-background-cyanDark p-6 rounded-lg shadow-lg w-[90%] md:w-[500px]">
        <h2 className="text-xl mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="opacity-90 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-background-cyanMedium  rounded-lg bg-background-cyanDark outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="opacity-90 text-sm font-bold mb-2">
              Nickname
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-background-cyanMedium  rounded-lg bg-background-cyanDark outline-none"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2  text-white rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0ff] text-black rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalForm;
