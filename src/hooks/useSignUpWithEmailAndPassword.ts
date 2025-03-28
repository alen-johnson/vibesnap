import { auth, db } from "../services/firebase";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import {
  setDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import useShowMessage from "./useShowMessage";
import useAuthStore from "../store/authStore";
import { signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";

const useSignUpWithEmailAndPassword = () => {
  //@ts-ignore
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const { showError } = useShowMessage();
  const loginUser = useAuthStore((state) => state.login);

  const signup = async (inputs: {
    email: string;
    password: string;
    username: string;
    fullname: string;
  }) => {
    if (
      !inputs.email ||
      !inputs.password ||
      !inputs.username ||
      !inputs.fullname
    ) {
      showError("Please fill in all fields!");
      return;
    }

    const uname = formatName(inputs.username);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", uname));
    const profSnap = await getDocs(q);

    if (!profSnap.empty) {
      showError("Username already exists");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: uname,
          password: inputs.password,
          email: inputs.email,
          fullname: inputs.fullname,
          bio: "",
          profilePicURL: "",
          coverPicURL: "",
          followers: [],
          following: [],
          createdAt: Date.now(),
        }),
      });

      if (!res.ok) {
        const data = await res.text();
        showError(data || "Signup failed");
      }

      const data = await res.json();
      const { user, firebaseToken } = data;
      localStorage.setItem("user-info", JSON.stringify(user));
      loginUser(user);
      console.log("user created");

      await signInWithCustomToken(auth, firebaseToken);


    } catch (error) {
      if (error instanceof Error) {
        showError("Error" + error.message);
      } else {
        showError("Error" + "An unknown error occurred");
      }
    }
  };
  return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;

const formatName = (name: string) => {
  return name.split(" ").join("").toLowerCase();
};
