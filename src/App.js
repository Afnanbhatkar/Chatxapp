import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  push,
  runTransaction,
  remove,
  onDisconnect,
} from "firebase/database";
import {
  FiSettings,
  FiArrowLeft,
  FiChevronRight,
  FiUser,
  FiEdit2,
  FiVideo,
  FiMessageSquare,
  FiMoon,
  FiShield,
  FiLogOut,
  FiTrash2,
} from "react-icons/fi";
import "./App.css";
import ReelsPage from "./ReelsPage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBtcajERxRaTNTP6xEoYSw_kSztCjMvbzA",
  authDomain: "chatx-app-18ebf.firebaseapp.com",
  databaseURL:
    "https://chatx-app-18ebf-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatx-app-18ebf",
  storageBucket: "chatx-app-18ebf.firebasestorage.app",
  messagingSenderId: "219873349448",
  appId: "1:219873349448:web:5850c5a2e2d7baf03fed7d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Theme presets
const THEME_PRESETS = [
  { name: "Emerald", color: "#10b981" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Teal", color: "#14b8a6" },
  { name: "Violet", color: "#7c3aed" },
];

export default function App() {
  // ------------------- State -------------------
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [uniqueId, setUniqueId] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const sliderRef = useRef(null);
  const [settingsPage, setSettingsPage] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null); // For signup/profile preview
  const [showProfile, setShowProfile] = useState(false);
  const [showReels, setShowReels] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [lightboxType, setLightboxType] = useState(null);
  const [lightboxLoading, setLightboxLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [showDeletePopupId, setShowDeletePopupId] = useState(null);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [signupAvatarGrid, setSignupAvatarGrid] = useState(false); // New: For signup grid
  const [signupActiveTab, setSignupActiveTab] = useState("animated"); // New: For signup tabs
  const [signupTouchStartX, setSignupTouchStartX] = useState(null); // New: For signup swipe
  const [signupTouchEndX, setSignupTouchEndX] = useState(null); // New: For signup swipe
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("animated");
  const fileInputRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const ANIMATED_IMAGES = [
    "/avatars/download.jpeg",
    "/avatars/icon.jpeg",
    "/avatars/icon2.jpeg",
    "/avatars/icon3.jpeg",
    "/avatars/icon4.jpeg",
    "/avatars/icon5.jpeg",
    "/avatars/icon6.jpeg",
    "/avatars/icon7.jpeg",
    "/avatars/icon8.jpeg",
  ];
  const ANIME_IMAGES = [
    "/avatars/anime2.jpeg",
    "/avatars/anime3.jpeg",
    "/avatars/anime4.jpeg",
    "/avatars/anime5.jpeg",
    "/avatars/anime6.jpeg",
    "/avatars/anime7.jpeg",
    "/avatars/anime8.jpeg",
    "/avatars/anime9.jpeg",
    "/avatars/anime10.jpeg",
  ];
  const CARTOON_IMAGES = [
    "/avatars/cartoon1.jpg",
    "/avatars/cartoon2.jpg",
    "/avatars/cartoon3.jpg",
    "/avatars/cartoon4.jpg",
    "/avatars/cartoon5.jpg",
    "/avatars/cartoon6.jpg",
    "/avatars/cartoon7.jpg",
    "/avatars/cartoon8.jpg",
    "/avatars/cartoon9.jpg",
  ];

  const [theme, setTheme] = useState(
    () => localStorage.getItem("app_theme") || "dark"
  );
  const [primaryColor, setPrimaryColor] = useState(
    () => localStorage.getItem("app_primary") || THEME_PRESETS[0].color
  );

  const [typing, setTyping] = useState(false);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
      setTyping(inputValue.length > 0);
    }, [inputValue]);

  // ------------------- Effects: Auth -------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("onAuthStateChanged: User UID:", currentUser.uid);
        setUser(currentUser);
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snap = await get(userRef);
        console.log("onAuthStateChanged: User snapshot exists:", snap.exists());
        if (snap.exists()) {
          const val = snap.val();
          console.log("onAuthStateChanged: Database data:", val);
          setUsername(val.username || currentUser.displayName || "User");
          setUniqueId(val.uniqueId);
          await update(userRef, { isOnline: true });
        } else {
          console.log("onAuthStateChanged: No database entry, waiting for signup");
          setUsername(currentUser.displayName || "User");
          setUniqueId(null);
        }
      } else {
        console.log("onAuthStateChanged: No user logged in");
        setUser(null);
        setUniqueId(null);
        setUsername("");
        setSelectedUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------
//  Listen for the other user typing (show bubble on their side)
// ---------------------------------------------------------------
const [otherTyping, setOtherTyping] = useState(false);
useEffect(() => {
  if (!user || !selectedUser) return;

  const chatId = [user.uid, selectedUser.uid].sort().join("_");
  const typingRef = ref(db, `typing/${chatId}/${selectedUser.uid}`);

  const unsub = onValue(typingRef, (snap) => {
    setOtherTyping(!!snap.val());   // true = typing, false = not typing
  });

  return () => unsub();
}, [user, selectedUser]);

  // Set offline on leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) update(ref(db, `users/${user.uid}`), { isOnline: false });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  // Load users map
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      setUsersMap(snapshot.val() || {});
    });
  }, []);

  // Inbox - Update without redirecting
  useEffect(() => {
    if (!user) return;
    const chatsRef = ref(db, "privateChats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userChats = [];
      Object.entries(data).forEach(([chatId, msgs]) => {
        const participants = chatId.split("_");
        if (participants.includes(user.uid)) {
          const otherUid = participants.find((uid) => uid !== user.uid);
          const lastMessage = Object.values(msgs).slice(-1)[0];
          userChats.push({ chatId, otherUid, lastMessage });
        }
      });
      userChats.sort(
        (a, b) =>
          new Date(`1970/01/01 ${b.lastMessage?.time}`) -
          new Date(`1970/01/01 ${a.lastMessage?.time}`)
      );
      setInbox(userChats);
    });
    return () => unsubscribe();
  }, [user]);

  // Messages auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat messages only for the selected user
  useEffect(() => {
    if (!user || !selectedUser) return;
    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const chatRef = ref(db, `privateChats/${chatId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      setMessages(snapshot.val() ? Object.values(snapshot.val()) : []);
    });
    return () => unsubscribe();
  }, [selectedUser, user]);

  // ──────────────────────────────────────────────────────────────
//  Listen for the other user typing
// ──────────────────────────────────────────────────────────────
useEffect(() => {
  if (!user || !selectedUser) return;

  const chatId = [user.uid, selectedUser.uid].sort().join("_");
  const typingRef = ref(db, `typing/${chatId}/${selectedUser.uid}`);

  const unsub = onValue(typingRef, (snap) => {
    setOtherTyping(!!snap.val());   // true = typing, false = not typing
  });

  return () => unsub();
}, [user, selectedUser]);
// ──────────────────────────────────────────────────────────────
//  Auto-remove typing status when user leaves the chat or disconnects
// ──────────────────────────────────────────────────────────────
useEffect(() => {
  if (!user || !selectedUser) return;

  const chatId = [user.uid, selectedUser.uid].sort().join("_");
  const myTypingRef = ref(db, `typing/${chatId}/${user.uid}`);

  // Remove typing flag when user disconnects
  const disconnectHandler = onDisconnect(myTypingRef);
  disconnectHandler.remove();

  // Also clean up immediately when component unmounts
  return () => {
    set(myTypingRef, null); // explicit cleanup
  };
}, [user, selectedUser]);

// ──────────────────────────────────────────────────────────────
//  Clear stale typing flag when opening chat
// ──────────────────────────────────────────────────────────────
useEffect(() => {
  if (!user || !selectedUser) return;

  const chatId = [user.uid, selectedUser.uid].sort().join("_");
  const myTypingRef = ref(db, `typing/${chatId}/${user.uid}`);
  set(myTypingRef, null); // clear my old flag
}, [user, selectedUser]);
  // Search
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!searchQuery.trim() || !user) return setSearchResult(null);
      const usersRef = ref(db, "users");
      const snap = await get(usersRef);
      const usersData = snap.val();
      if (!usersData) return;
      const found = Object.values(usersData).find(
        (u) =>
          (u.username?.toLowerCase() === searchQuery.toLowerCase() ||
            u.uniqueId?.toString() === searchQuery) &&
          u.uid !== user.uid
      );
      setSearchResult(found || null);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  // Theme application
  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    localStorage.setItem("app_primary", primaryColor);
    const darkVars = {
      "--app-bg": "#0f1724",
      "--card-bg": "#0f1724",
      "--panel-bg": "#111827",
      "--text": "#e5e7eb",
      "--muted": "#9ca3af",
      "--input-bg": "#374151",
      "--input-text": "#ffffff",
    };
    const lightVars = {
      "--app-bg": "#f8fafc",
      "--card-bg": "#ffffff",
      "--panel-bg": "#f1f5f9",
      "--text": "#0f1724",
      "--muted": "#6b7280",
      "--input-bg": "#ffffff",
      "--input-text": "#000000",
    };
    const vars = theme === "dark" ? darkVars : lightVars;
    const root = document.documentElement;
    root.style.setProperty("--primary", primaryColor);
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.style.background = "var(--app-bg)";
    document.body.style.color = "var(--text)";
  }, [theme, primaryColor]);

  // ------------------- Auth Actions -------------------
  const handleSignUp = async () => {
    if (!email || !password || !username) return alert("Fill all fields!");
    try {
      console.log("handleSignUp: Starting signup for email:", email);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      console.log("handleSignUp: User created, UID:", res.user.uid);
      let photoURL = null;
      if (avatarPreview) {
        photoURL = avatarPreview; // Use selected image URL (short, no error)
      }
      await updateProfile(res.user, { 
        displayName: username,
        photoURL: photoURL 
      });
      console.log("handleSignUp: displayName set to:", username);
      const userRef = ref(db, `users/${res.user.uid}`);
      const lastIdRef = ref(db, "lastUniqueId");
      let newId;
      const snap = await get(userRef);
      console.log("handleSignUp: User exists in DB:", snap.exists());
      if (snap.exists()) {
        newId = snap.val().uniqueId;
        console.log("handleSignUp: Using existing uniqueId:", newId);
      } else {
        await runTransaction(lastIdRef, (currentId) => {
          return (currentId || 100000) + 1;
        }).then((result) => {
          newId = result.snapshot.val();
          console.log("handleSignUp: Assigned new uniqueId:", newId);
        });
        await set(userRef, {
          uid: res.user.uid,
          username,
          email,
          uniqueId: newId,
          isOnline: true,
          profilePic: photoURL, // Save to DB
        });
        console.log("handleSignUp: User data set in DB");
      }
      setUniqueId(newId);
      setUsername(username);
      setIsSigningUp(false);
      setAvatarPreview(null); // Reset
      setSignupAvatarGrid(false);
      alert(`Sign Up successful! Your unique ID: ${newId}`);
    } catch (err) {
      console.error("handleSignUp: Error:", err);
      alert(err.message);
    }
  };

  // New: Handle avatar select for signup (same as profile)
  const handleSignupAvatarSelect = (imageUrl) => {
    if (!imageUrl) return;
    setAvatarPreview(imageUrl); // Set preview
    setSignupAvatarGrid(false); // Close grid
  };

  const handleLogin = async () => {
    if (!email || !password) return alert("Fill all fields!");
    try {
      console.log("handleLogin: Attempting login for email:", email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("handleLogin: Login successful");
      setSettingsPage(false);
      setShowProfile(false);
      setShowReels(false);
    } catch (err) {
      console.error("handleLogin: Error:", err);
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    if (user) {
      console.log("handleLogout: Logging out user:", user.uid);
      await update(ref(db, `users/${user.uid}`), { isOnline: false });
    }
    await signOut(auth);
    setUser(null);
    setSelectedUser(null);
    setMessages([]);
    setSearchResult(null);
    setUniqueId(null);
    setUsername("");
    document.body.style.overflow = "auto";
    console.log("handleLogout: Logout complete");
  };

  // ------------------- Profile Actions -------------------
  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      alert("Username cannot be empty!");
      return;
    }
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");
      await updateProfile(currentUser, { displayName: newUsername });
      await update(ref(db, `users/${currentUser.uid}`), { username: newUsername });
      setUsername(newUsername);
      setEditingUsername(false);
      alert("Username updated successfully!");
    } catch (err) {
      console.error("Failed to update username:", err);
      alert("Failed to update username: " + err.message);
    }
  };

  const handleAvatarSelect = async (imageUrl) => {
    if (!imageUrl) return;
    setProfilePicLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");
      await updateProfile(currentUser, { photoURL: imageUrl });
      await update(ref(db, `users/${currentUser.uid}`), { profilePic: imageUrl });
      setUser({ ...currentUser, photoURL: imageUrl });
      setShowAvatarGrid(false);
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      alert("Failed to update profile picture: " + err.message);
    } finally {
      setProfilePicLoading(false);
    }
  };

  // ------------------- Chat Actions -------------------
  const startPrivateChat = (otherUser) => {
    setSelectedUser(otherUser);
    setMessages([]);
  };
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;
    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const chatRef = ref(db, `privateChats/${chatId}`);
    await push(chatRef, {
      senderUid: user.uid,
      senderName: username,
      text,
      time: new Date().toLocaleTimeString(),
      replyTo: replyingTo || null,
    });
    // CLEAR TYPING AFTER SEND
  const myTypingRef = ref(db, `typing/${chatId}/${user.uid}`);
  await set(myTypingRef, null);
    setText("");
    setReplyingTo(null);
  };
  const deleteMessage = async (msgKey) => {
    if (!selectedUser) return;
    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const msgRef = ref(db, `privateChats/${chatId}/${msgKey}`);
    await remove(msgRef);
    setShowDeletePopupId(null);
  };
  const deleteChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) return;
    try {
      const chatId = [user.uid, selectedUser.uid].sort().join("_");
      const chatRef = ref(db, `privateChats/${chatId}`);
      await remove(chatRef);
      setInbox((prev) => prev.filter((chat) => chat.chatId !== chatId));
      setSelectedUser(null);
      setMessages([]);
      setShowChatMenu(false);
      alert("Chat deleted successfully");
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat");
    }
  };
  const deleteAllChats = async () => {
    if (!window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) return;
    try {
      for (const chat of inbox) {
        const chatRef = ref(db, `privateChats/${chat.chatId}`);
        await remove(chatRef);
      }
      setInbox([]);
      setSelectedUser(null);
      setMessages([]);
      alert("All chats deleted successfully");
    } catch (err) {
      console.error("Error deleting chats:", err);
      alert("Failed to delete some chats");
    }
  };
  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const chatId = [user.uid, selectedUser.uid].sort().join("_");
      const chatRef = ref(db, `privateChats/${chatId}`);
      await push(chatRef, {
        senderUid: user.uid,
        senderName: username,
        file: reader.result,
        fileType: file.type.startsWith("image") ? "image" : "video",
        time: new Date().toLocaleTimeString(),
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ------------------- Utilities -------------------
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX && touchEndX) {
      const diffX = touchStartX - touchEndX;
      const minSwipeDistance = 50;
      if (diffX > minSwipeDistance) {
        if (activeTab === "animated") setActiveTab("anime");
        else if (activeTab === "anime") setActiveTab("cartoon");
      } else if (diffX < -minSwipeDistance) {
        if (activeTab === "cartoon") setActiveTab("anime");
        else if (activeTab === "anime") setActiveTab("animated");
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // New: Signup touch handlers (same as profile)
  const handleSignupTouchStart = (e) => {
    setSignupTouchStartX(e.touches[0].clientX);
  };
  const handleSignupTouchMove = (e) => {
    setSignupTouchEndX(e.touches[0].clientX);
  };
  const handleSignupTouchEnd = () => {
    if (signupTouchStartX && signupTouchEndX) {
      const diffX = signupTouchStartX - signupTouchEndX;
      const minSwipeDistance = 50;
      if (diffX > minSwipeDistance) {
        if (signupActiveTab === "animated") setSignupActiveTab("anime");
        else if (signupActiveTab === "anime") setSignupActiveTab("cartoon");
      } else if (diffX < -minSwipeDistance) {
        if (signupActiveTab === "cartoon") setSignupActiveTab("anime");
        else if (signupActiveTab === "anime") setSignupActiveTab("animated");
      }
    }
    setSignupTouchStartX(null);
    setSignupTouchEndX(null);
  };

  const openSettings = () => {
    setSettingsPage(true);
    document.body.style.overflow = "hidden";
  };
  const closeSettings = () => {
    setSettingsPage(false);
    document.body.style.overflow = "auto";
  };
  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };
  const chooseColor = (hex) => {
    setPrimaryColor(hex);
  };

// ---------------------------------------------------------------
//  LOGIN / SIGN-UP PAGE – DARK / LIGHT MODE (uses your `theme`)
// ---------------------------------------------------------------
if (!user) {
  // `theme` comes from the state you already have:
  // const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "dark");
  const isLight = theme === "light";

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden"
      style={{
        background: isLight ? "#f9fafb" : "var(--app-bg)",
        color: isLight ? "#1f2937" : "var(--text)",
      }}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${primaryColor}${
              isLight ? "20" : "30"
            } 0%, transparent 70%)`,
            animation: "gentlePulse 5s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.4); opacity: 0.3; }
        }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes textPulse { 0%, 100% { text-shadow: 0 0 0px ${primaryColor}95; } 50% { text-shadow: 0 0 6px ${primaryColor}100; } }
        @keyframes letterPop { 0% { opacity: 0; transform: scale(0.3) translateY(10px); } 70% { opacity: 1; transform: scale(1.1) translateY(-3px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes bubblePulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.4); } }

        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .letter { display: inline-block; animation: letterPop 0.5s ease-out forwards; will-change: transform, opacity; transform: translateZ(0); backface-visibility: hidden; }
        .bubble { display: inline-block; width: 8px; height: 8px; background: ${primaryColor}; border-radius: 50%; margin: 0 3px; animation: bubblePulse 1.2s ease-in-out infinite; }
        .bubble:nth-child(1) { animation-delay: 0s; }
        .bubble:nth-child(2) { animation-delay: 0.2s; }
        .bubble:nth-child(3) { animation-delay: 0.4s; }
        .sharp-text { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; transform: translateZ(0); backface-visibility: hidden; }
      `}</style>

      {/* Main Card */}
      <div
        className="w-full max-w-md p-8 rounded-3xl shadow-2xl border sharp-text"
        style={{
          background: isLight ? "rgba(255,255,255,0.92)" : "rgba(30,30,50,0.75)",
          borderColor: `${primaryColor}${isLight ? "30" : "40"}`,
          animation: "float 6s ease-in-out infinite",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Animated title */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl font-extrabold bg-clip-text text-transparent sharp-text"
            style={{
              backgroundImage: `linear-gradient(135deg, ${primaryColor}, #60a5fa, #a78bfa)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.03em",
              textRendering: "geometricPrecision",
              animation: "textPulse 2.5s ease-in-out infinite",
            }}
          >
            {"Reactify".split("").map((l, i) => (
              <span key={i} className="letter" style={{ animationDelay: `${i * 0.08}s` }}>
                {l}
              </span>
            ))}
          </h1>

          <p
            className="text-sm mt-3 animate-fadeInUp"
            style={{
              animationDelay: "0.8s",
              opacity: isLight ? 0.8 : 0.2,
              color: isLight ? "#4b5563" : "inherit",
            }}
          >
            {isSigningUp ? "Craft your identity" : "Welcome back"}
          </p>
        </div>

        {/* Avatar – only on sign-up */}
        {isSigningUp && (
          <div className="flex justify-center mb-6 animate-fadeInUp" style={{ animationDelay: "0.9s" }}>
            <div className="relative group">
              <div
                className={`w-24 h-24 rounded-full overflow-hidden border-4 border-dashed flex items-center justify-center transition-all group-hover:border-solid ${
                  isLight
                    ? "border-gray-400 group-hover:border-gray-600"
                    : "border-gray-500 group-hover:border-white"
                }`}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg
                    className={`w-12 h-12 ${isLight ? "text-gray-500" : "text-gray-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              <button
                className="absolute -bottom-2 -right-2 p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                onClick={() => setSignupAvatarGrid(true)}
                style={{ background: primaryColor, color: "#fff" }}
              >
                <FiEdit2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {isSigningUp && (
            <div className="animate-fadeInUp" style={{ animationDelay: "1s" }}>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-4 rounded-2xl border text-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-opacity-30"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setInputValue(e.target.value); }}
                style={{
                  background: isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.08)",
                  color: isLight ? "#1f2937" : "var(--text)",
                  borderColor: `${primaryColor}40`,
                  backdropFilter: "blur(12px)",
                }}
              />
            </div>
          )}

          <div className="animate-fadeInUp" style={{ animationDelay: isSigningUp ? "1.1s" : "1s" }}>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 rounded-2xl border text-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-opacity-30"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setInputValue(e.target.value); }}
              style={{
                background: isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.08)",
                color: isLight ? "#1f2937" : "var(--text)",
                borderColor: `${primaryColor}40`,
                backdropFilter: "blur(12px)",
              }}
            />
          </div>

          <div className="animate-fadeInUp" style={{ animationDelay: isSigningUp ? "1.2s" : "1.1s" }}>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-2xl border text-lg outline-none transition-all duration-300 focus:ring-4 focus:ring-opacity-30"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setInputValue(e.target.value); }}
              style={{
                background: isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.08)",
                color: isLight ? "#1f2937" : "var(--text)",
                borderColor: `${primaryColor}40`,
                backdropFilter: "blur(12px)",
              }}
            />
          </div>

          {/* Typing bubbles */}
          {typing && (
            <div className="flex justify-center py-2 animate-fadeInUp" style={{ animationDelay: "1.3s" }}>
              <span className="bubble" />
              <span className="bubble" />
              <span className="bubble" />
            </div>
          )}

          <button
            onClick={isSigningUp ? handleSignUp : handleLogin}
            className="w-full py-4 rounded-2xl font-bold text-lg relative overflow-hidden transition-all duration-300 hover:scale-105 animate-fadeInUp"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #60a5fa)`,
              color: "#fff",
              animationDelay: isSigningUp ? "1.4s" : "1.3s",
              boxShadow: `0 8px 25px ${primaryColor}40`,
            }}
          >
            {isSigningUp ? "Join Reactify" : "Enter"}
          </button>
        </div>

        {/* Toggle */}
        <p
          className="text-center mt-6 text-sm animate-fadeInUp"
          style={{
            animationDelay: "1.5s",
            color: isLight ? "#4b5563" : "inherit",
          }}
        >
          {isSigningUp ? "Already have an account?" : "New here?"}{" "}
          <span
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="font-bold cursor-pointer underline-offset-4 hover:underline"
            style={{ color: primaryColor }}
          >
            {isSigningUp ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>

      {/* Avatar-grid modal (sign-up) */}
      {signupAvatarGrid && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000000] backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSignupAvatarGrid(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl p-6 relative sharp-text"
            style={{
              background: isLight ? "#ffffff" : "var(--card-bg)",
              color: isLight ? "#1f2937" : "var(--text)",
              boxShadow: isLight ? "0 20px 40px rgba(0,0,0,0.15)" : "inherit",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-lg"
              style={{ color: isLight ? "#9ca3af" : "var(--muted)" }}
              onClick={() => setSignupAvatarGrid(false)}
            >
              X
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center">Choose Avatar</h3>

            <div className="flex justify-center gap-2 mb-4">
              {["animated", "anime", "cartoon"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    signupActiveTab === tab
                      ? "bg-[var(--primary)] text-white"
                      : isLight
                      ? "bg-gray-200 text-gray-800"
                      : "bg-[var(--panel-bg)]"
                  }`}
                  onClick={() => setSignupActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div
              className="overflow-hidden"
              ref={sliderRef}
              onTouchStart={handleSignupTouchStart}
              onTouchMove={handleSignupTouchMove}
              onTouchEnd={handleSignupTouchEnd}
            >
              <div
                className="flex transition-transform duration-500"
                style={{
                  transform: `translateX(-${
                    signupActiveTab === "animated" ? 0 : signupActiveTab === "anime" ? 33.33 : 66.66
                  }%)`,
                  width: "300%",
                }}
              >
                {[
                  { images: ANIMATED_IMAGES, key: "animated" },
                  { images: ANIME_IMAGES, key: "anime" },
                  { images: CARTOON_IMAGES, key: "cartoon" },
                ].map(({ images, key }) => (
                  <div key={key} className="w-full grid grid-cols-3 gap-3 px-2">
                    {images.map((img, i) => (
                      <button
                        key={`${key}-${i}`}
                        className="aspect-square rounded-xl overflow-hidden hover:scale-110 transition-transform"
                        onClick={() => handleSignupAvatarSelect(img)}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  // Main logged-in UI
  return (
    <div
      className="max-auto flex flex-col items-center justify-start pt-6 px-2 sm:px-0 min-h-screen"
      style={{ background: "var(--app-bg)", color: "var(--text)" }}
    >
      {/* Header */}
      {!selectedUser && !settingsPage && (
        <div className="Hookup relative w-full max-w-[420px] mb-4">
          <div
            className="py-2 font-semibold text-lg rounded-2xl flex justify-between items-center px-4 shadow-md"
            style={{
              background: "var(--panel-bg)",
              color: "var(--text)",
            }}
          >
            <span>💬 Hookapp</span>
            <button
              onClick={openSettings}
              className="p-2 rounded-full hover:bg-gray-700 transition-all group"
              style={{ color: "var(--text)" }}
            >
              <FiSettings
                size={22}
                className="transition-transform duration-500 group-hover:rotate-[180deg]"
                style={{ color: "var(--primary)" }}
              />
            </button>
          </div>
        </div>
      )}

      {/* ⚙️ Settings Page Overlay */}
{settingsPage && !showProfile && (
  <>
    <style>{`
      body { overflow: hidden !important; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>

    <div
      className="fixed inset-0 backdrop-blur-lg z-[999999] flex justify-center items-start"
      style={{ background: "var(--card-bg)" }}
    >
      <div
        className="relative w-[420px] max-w-full h-full flex flex-col"
        style={{ background: "var(--card-bg)", color: "var(--text)" }}
      >
        {/* Fixed Header */}
        <div
          className="text-center text-2xl font-semibold border-b pb-4 flex justify-between items-center sticky top-0 z-20 px-5 pt-6"
          style={{ borderColor: "rgba(148,163,184,0.06)", background: "var(--card-bg)" }}
        >
          <span>⚙️ Settings</span>
          <button
            onClick={closeSettings}
            className="text-gray-400 hover:text-white transition-all"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28"
          style={{
            background: "var(--card-bg)",
            color: "var(--text)",
            height: "calc(100vh - 80px - 80px)", // Adjust based on header (~80px) and footer (~80px) heights
          }}
        >
          <div
            className="rounded-2xl p-4 space-y-2 mt-4"
            style={{
              background: theme === "dark" ? "#1F2937" : "var(--panel-bg)",
              color: theme === "dark" ? "#fff" : "var(--text)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Account
            </p>

            <button
              onClick={() => {
                setShowProfile(true);
                setNewUsername(username); // Assuming setNewUsername is defined elsewhere
              }}
              className="w-full flex justify-between items-center p-3 rounded-xl hover:opacity-95 transition-all"
              style={{ background: "transparent", color: "var(--text)" }}
            >
              <div className="flex items-center gap-3">
                <FiUser size={20} style={{ color: "var(--primary)" }} />
                <span>Profile</span>
              </div>
              <FiChevronRight size={18} style={{ color: "var(--muted)" }} />
            </button>

            <button
              className="w-full flex justify-between items-center p-3 rounded-xl hover:opacity-95 transition-all"
              style={{ background: "transparent", color: "var(--text)" }}
            >
              <div className="flex items-center gap-3">
                <FiMessageSquare size={20} style={{ color: "var(--primary)" }} />
                <span>Chat History</span>
              </div>
              <FiChevronRight size={18} style={{ color: "var(--muted)" }} />
            </button>

            <button
              onClick={deleteAllChats} // Assuming deleteAllChats is defined
              className="w-full flex justify-between items-center p-3 rounded-xl hover:opacity-95 transition-all"
              style={{
                background: "transparent",
                color: theme === "dark" ? "white" : "black",
              }}
            >
              <div className="flex items-center gap-3">
                <FiTrash2
                  size={20}
                  style={{ color: "var(--primary)" }}
                />
                <span style={{ color: theme === "dark" ? "white" : "black" }}>
                  Delete All Chats
                </span>
              </div>
              <FiChevronRight
                size={18}
                style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
              />
            </button>
          </div>

          <div
            className="rounded-2xl p-4 space-y-2 mt-4"
            style={{
              background: theme === "dark" ? "#1F2937" : "var(--panel-bg)",
              color: theme === "dark" ? "#fff" : "var(--text)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Preferences
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <FiMoon size={20} style={{ color: "var(--primary)" }} />
                <div>
                  <div>Dark Mode</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    Toggle between dark and light UI
                  </div>
                </div>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={theme === "dark"}
                    onChange={toggleTheme}
                  />
                  <div
                    className="w-11 h-6 rounded-full peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white"
                    style={{
                      background: theme === "dark" ? "var(--primary)" : "#9ca3af",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: theme === "dark" ? "calc(100% - 18px)" : "6px",
                        transform: "translateY(-50%)",
                        width: 14,
                        height: 14,
                        background: "#ffffff",
                        borderRadius: "50%",
                        transition: "left 0.18s",
                      }}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="p-2 rounded-lg">
              <div className="mb-2 text-sm font-medium" style={{ color: "var(--muted)" }}>
                Theme Color
              </div>
              <div className="flex gap-2 flex-wrap">
                {THEME_PRESETS.map((p) => {
                  const selected = p.color.toLowerCase() === primaryColor.toLowerCase();
                  return (
                    <button
                      key={p.color}
                      onClick={() => chooseColor(p.color)}
                      title={p.name}
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                      style={{
                        background: p.color,
                        boxShadow: selected ? "0 0 0 4px rgba(0,0,0,0.2) inset, 0 6px 16px rgba(0,0,0,0.2)" : "",
                        transform: selected ? "scale(1.05)" : "scale(1)",
                      }}
                    />
                  );
                })}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => chooseColor(e.target.value)}
                  className="ml-2 w-10 h-10 p-0 border-0 bg-transparent"
                  title="Custom color"
                />
              </div>
              <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Selected primary: <span style={{ color: "var(--primary)", fontWeight: 600 }}>{primaryColor}</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 space-y-2 mt-4"
            style={{
              background: theme === "dark" ? "#1F2937" : "var(--panel-bg)",
              color: theme === "dark" ? "#fff" : "var(--text)",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Security
            </p>

            <button
              className="w-full flex justify-between items-center p-3 rounded-xl hover:opacity-95 transition-all"
              style={{ background: "transparent", color: "var(--text)" }}
            >
              <div className="flex items-center gap-3">
                <FiShield size={20} style={{ color: "var(--primary)" }} />
                <span>Privacy & Security</span>
              </div>
              <FiChevronRight size={18} style={{ color: "var(--muted)" }} />
            </button>
          </div>

          <div className="w-full border-t border-gray-700 my-6"></div>

          <div className="w-full text-sm text-center mb-6" style={{ color: "var(--muted)" }}>
            <div>Your ID:</div>
            <div className="font-semibold" style={{ color: "var(--text)" }}>{uniqueId}</div>
          </div>
        </div>

        {/* Fixed Logout Button */}
        <div
          className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[420px] max-w-full px-5 z-[1000000]"
          style={{ pointerEvents: "auto" }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex justify-center items-center gap-2 py-3 rounded-xl transition-all shadow-lg"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  </>
)}

      {/* Profile Page — Fullscreen Overlay */}
{showProfile && (
  <>
    <style>{`
      body { overflow: hidden !important; }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .profile-pic-container {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .profile-pic-container:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }
      .profile-card {
        animation: slideUp 0.3s ease-out;
      }
      .avatar-grid-item {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .avatar-grid-item:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .tab-button {
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      .tab-button.active {
        background: var(--primary);
        color: #fff;
      }
      .tab-button:not(.active) {
        background: var(--panel-bg);
        color: var(--text);
      }
      .tab-button:hover:not(.active) {
        background: var(--card-bg);
        opacity: 0.9;
      }
      .avatar-slider {
        display: flex;
        transition: transform 0.5s ease-in-out;
        width: 300%;
        touch-action: pan-y; /* Allow vertical scrolling, restrict horizontal to handle swipes */
      }
      .avatar-grid {
        width: 33.33%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `}</style>

    <div
      className="fixed inset-0 flex flex-col items-center justify-start z-50"
      style={{ background: "var(--app-bg)", color: "var(--text)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between w-full max-w-[420px] px-4 py-3 shadow-sm"
        style={{ background: "var(--panel-bg)" }}
      >
        <button
          onClick={() => setShowProfile(false)}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          style={{ color: "var(--muted)" }}
        >
          <FiArrowLeft size={24} />
        </button>
        <h2 className="flex-1 text-xl font-bold text-center">Your Profile</h2>
        <div className="w-8" />
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 w-full max-w-[420px] mx-auto px-6 py-8 overflow-y-auto no-scrollbar"
        style={{ color: "var(--text)" }}
      >
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="relative mb-8 profile-pic-container">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{ background: "var(--panel-bg)" }}
            >
              {profilePicLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--primary)" }}
                  ></div>
                </div>
              ) : user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                  style={{ animation: "pulse 2s infinite" }}
                />
              ) : (
                <FiUser size={60} style={{ color: "var(--muted)" }} />
              )}

              <button
                className="absolute bottom-1 right-1 rounded-full p-2 transition-transform hover:scale-110"
                onClick={() => setShowAvatarGrid(true)}
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                <FiEdit2 size={16} />
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div
            className="w-full rounded-2xl p-6 text-sm flex flex-col gap-4 profile-card"
            style={{
              background: "var(--panel-bg)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-base">Name</span>
              {editingUsername ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-1 p-3 rounded-xl border outline-none transition"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--text)",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    }}
                    placeholder="Enter new username"
                  />
                  <button
                    onClick={handleUsernameChange}
                    className="px-4 py-2 rounded-xl font-medium transition hover:opacity-90"
                    style={{ background: "var(--primary)", color: "#fff" }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="px-4 py-2 rounded-xl font-medium transition hover:opacity-90"
                    style={{ background: "#6b7280", color: "#fff" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-base">
                    {username || "Unknown"}
                  </span>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="p-2 rounded-full hover:bg-gray-700 transition"
                    style={{ color: "var(--primary)" }}
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-base">Email</span>
              <span className="text-base">{user?.email || "Not available"}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-base">User ID</span>
              <span className="text-base">{uniqueId || "Not assigned"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarGrid && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000000] backdrop-blur-sm"
          style={{ background: "rgba(0, 0, 0, 0.6)" }}
          onClick={() => setShowAvatarGrid(false)}
        >
          <div
            className="w-full max-w-[360px] bg-gray-800 rounded-2xl p-6 relative"
            style={{ background: "var(--card-bg)", color: "var(--text)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              style={{ color: "var(--muted)" }}
              onClick={() => setShowAvatarGrid(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Choose Profile Picture
            </h3>
            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                className={`tab-button ${activeTab === "animated" ? "active" : ""}`}
                onClick={() => setActiveTab("animated")}
              >
                Animated
              </button>
              <button
                className={`tab-button ${activeTab === "anime" ? "active" : ""}`}
                onClick={() => setActiveTab("anime")}
              >
                Anime
              </button>
              <button
                className={`tab-button ${activeTab === "cartoon" ? "active" : ""}`}
                onClick={() => setActiveTab("cartoon")}
              >
                Cartoon
              </button>
            </div>
            {/* Sliding Grids */}
            <div
              className="overflow-hidden"
              ref={sliderRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="avatar-slider"
                style={{
                  transform: `translateX(-${
                    activeTab === "animated" ? 0 : activeTab === "anime" ? 33.33 : 66.66
                  }%)`,
                }}
              >
                {/* Animated Grid */}
                <div className="avatar-grid">
                  {ANIMATED_IMAGES.map((image, index) => (
                    <button
                      key={`animated-${index}`}
                      className="w-full aspect-square rounded-lg overflow-hidden avatar-grid-item"
                      onClick={() => handleAvatarSelect(image)}
                    >
                      <img
                        src={image}
                        alt={`Animated Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{ animation: "pulse 2s infinite" }}
                      />
                    </button>
                  ))}
                </div>
                {/* Anime Grid */}
                <div className="avatar-grid">
                  {ANIME_IMAGES.map((image, index) => (
                    <button
                      key={`anime-${index}`}
                      className="w-full aspect-square rounded-lg overflow-hidden avatar-grid-item"
                      onClick={() => handleAvatarSelect(image)}
                    >
                      <img
                        src={image}
                        alt={`Anime Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{ animation: "pulse 2s infinite" }}
                      />
                    </button>
                  ))}
                </div>
                {/* Cartoon Grid */}
                <div className="avatar-grid">
                  {CARTOON_IMAGES.map((image, index) => (
                    <button
                      key={`cartoon-${index}`}
                      className="w-full aspect-square rounded-lg overflow-hidden avatar-grid-item"
                      onClick={() => handleAvatarSelect(image)}
                    >
                      <img
                        src={image}
                        alt={`Cartoon Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{ animation: "pulse 2s infinite" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
)}

      {/* Search & Inbox */}
      {!selectedUser && !settingsPage && !showProfile && !showReels && (
        <div className="w-full max-w-[420px] mb-4">
          <div className="flex gap-2 mb-2 flex-col sm:flex-row p-1 rounded-full">
            
            <input
              type="text"
              placeholder="Search and start new chat"
              className="flex-1 p-2 outline-none rounded-full transition-all duration-300"
              style={{
                background: theme === "dark" ? "#1f2937" : "#f3f4f6",
                color: theme === "dark" ? "#fff" : "#000",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchResult && (
  <>
    <style>{`
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `}</style>
    <div
      className="flex items-center p-2 mb-2 rounded-xl cursor-pointer"
      style={{ background: "var(--card-bg)", color: "var(--text)" }}
      onClick={() => startPrivateChat(searchResult)}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden"
        style={{ background: "var(--panel-bg)" }}
      >
        {searchResult.profilePic || searchResult.photoURL ? (
          <img
            src={searchResult.profilePic || searchResult.photoURL}
            alt={`${searchResult.username}'s profile`}
            className="w-10 h-10 rounded-full object-cover"
            style={{ animation: "pulse 2s infinite" }}
          />
        ) : (
          <FiUser size={24} style={{ color: "var(--muted)" }} />
        )}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{searchResult.username}</div>
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          ID: {searchResult.uniqueId}
        </div>
      </div>
      <div
        className={`w-3 h-3 rounded-full ${
          searchResult.isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      ></div>
    </div>
  </>
)}

          {inbox.length > 0 && (
  <>
    <style>{`
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `}</style>
    <div
      className="mt-4 rounded-xl max-h-100 overflow-y-auto no-scrollbar"
      style={{ background: "var(--panel-bg)" }}
    >
      {inbox.map((chat) => {
        const otherUser = usersMap[chat.otherUid];
        if (!otherUser) return null;

        return (
          <div
            key={chat.chatId}
            className="flex items-center p-2 hover:opacity-95 relative group"
            onClick={() => startPrivateChat(otherUser)}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden"
              style={{ background: "var(--panel-bg)" }}
            >
              {otherUser.profilePic || otherUser.photoURL ? (
                <img
                  src={otherUser.profilePic || otherUser.photoURL}
                  alt={`${otherUser.username}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ animation: "pulse 2s infinite" }}
                />
              ) : (
                <FiUser size={24} style={{ color: "var(--muted)" }} />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{otherUser.username}</div>
              <div className="text-sm" style={{ color: "var(--muted)" }}>
                {chat.lastMessage?.text || "No messages yet"}
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                otherUser.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
          </div>
        );
      })}
    </div>
  </>

          )}
        </div>
      )}

      {selectedUser && (
  <div
    className="fixed sm:relative inset-0 w-screen h-screen sm:w-full sm:max-w-[420px] sm:h-[650px] bg-gray-800 shadow-2xl flex flex-col animate-fadeIn z-50"
    style={{ background: "var(--panel-bg)" }}
  >
    {/* HEADER */}
    <div
      className="sticky top-0 flex items-center justify-between px-4 py-3 shadow-md z-10"
      style={{ background: "var(--panel-bg)", color: "var(--text)" }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setSelectedUser(null);
            setShowChatMenu(false);
          }}
          className="text-xl p-1 rounded-full"
          style={{ color: "var(--muted)" }}
        >
          ←
        </button>

        {selectedUser.profilePic ? (
          <img
            src={selectedUser.profilePic}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {selectedUser.username[0].toUpperCase()}
          </div>
        )}

        <span className="font-semibold">{selectedUser.username}</span>
      </div>

      <div className="flex items-center gap-4 relative">
        <button className="hover:bg-gray-700 p-2 rounded-full">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l3 5-2 2 3 5 5-3 2 2 5 3V5H3z" />
          </svg>
        </button>

        <button className="hover:bg-gray-700 p-2 rounded-full">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 0H5a2 2 0 01-2-2V10a2 2 0 012-2h4m6 0v4m0 0l4 4" />
          </svg>
        </button>

        <button
          className="hover:bg-gray-700 p-2 rounded-full relative"
          onClick={() => setShowChatMenu(!showChatMenu)}
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {showChatMenu && (
          <div
            className={`absolute z-50 w-[160px] rounded-2xl shadow-lg px-1 py-1 select-none top-12 right-0
              ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`absolute -top-2 right-4 w-3 h-3 rotate-45
                ${theme === "dark" ? "bg-gray-800 border-l border-t border-gray-700" : "bg-white border-l border-t border-gray-300"}`}
            ></div>
            <button
              onClick={deleteChat}
              className={`flex items-center w-full px-3 py-2 rounded-xl text-sm transition duration-150
                ${theme === "dark" ? "text-red-400 hover:bg-gray-700" : "text-red-500 hover:bg-red-100"}`}
            >
              <FiTrash2 size={14} className="mr-2" />
              Delete Chat
            </button>
          </div>
        )}
      </div>
    </div>

    {/* MESSAGES CONTAINER */}
    <div
      ref={messagesContainerRef}
      className="flex-grow p-1 overflow-y-auto space-y-3"
      style={{ paddingBottom: "60px" }}
      onClick={() => {
        setShowDeletePopupId(null);
        setShowChatMenu(false);
      }}
    >
      {/* ALL MESSAGES */}
      {messages.map((msg, i) => {
        const isOwn = msg.senderUid === user.uid;
        const isMedia = msg.file;
        let touchStartX = null;
        let longPressTimeout = null;

        return (
          <div
            key={i}
            className={`flex ${isOwn ? "justify-end" : "justify-start"} px-3 my-1`}
          >
            <div
              className={`relative group max-w-[80%] sm:max-w-[70%] break-words transition-transform duration-200 ease-out`}
              style={{
                background: isOwn
                  ? "var(--primary)"
                  : theme === "dark"
                    ? "#374151"
                    : "#E5E7EB",
                color: isOwn ? "#fff" : theme === "dark" ? "#fff" : "#000",
                borderRadius: 16,
                borderTopLeftRadius: isOwn ? 16 : 6,
                borderTopRightRadius: isOwn ? 6 : 16,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                padding: "8px",
                transition: "transform 0.25s ease",
                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
                position: "relative",
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isOwn || !isMedia) {
                  setShowDeletePopupId(msg.time);
                }
              }}
              onTouchStart={(e) => {
                touchStartX = e.touches[0].clientX;
                if (isOwn) {
                  longPressTimeout = setTimeout(() => {
                    setShowDeletePopupId(msg.time);
                  }, 600);
                }
              }}
              onTouchMove={(e) => {
                if (!touchStartX) return;
                const diff = e.touches[0].clientX - touchStartX;
                if (
                  (isOwn && diff < 0 && Math.abs(diff) < 100) ||
                  (!isOwn && diff > 0 && diff < 100)
                ) {
                  e.currentTarget.style.transform = `translateX(${diff}px)`;
                }
                if (longPressTimeout) clearTimeout(longPressTimeout);
              }}
              onTouchEnd={(e) => {
                if (!touchStartX) return;
                const diff = e.changedTouches[0].clientX - touchStartX;
                if ((!isOwn && diff > 60) || (isOwn && diff < -60)) {
                  setReplyingTo(msg);
                  setTimeout(() => {
                    document.querySelector("#messageInput")?.focus();
                  }, 100);
                }
                e.currentTarget.style.transform = "translateX(0)";
                touchStartX = null;
                if (longPressTimeout) clearTimeout(longPressTimeout);
              }}
            >
              {/* REPLY ARROW */}
              <div
                className={`absolute ${isOwn ? "-left-7" : "-right-7"} top-1/2 -translate-y-1/2 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyingTo(msg);
                  setTimeout(() => {
                    document.querySelector("#messageInput")?.focus();
                  }, 100);
                }}
                title="Reply"
              >
                <span className="text-gray-500 hover:text-blue-500 text-lg">↪</span>
              </div>

              {/* REPLY PREVIEW */}
              {msg.replyTo && (
                <div
                  className="px-2 py-1 mb-1 rounded-md text-xs break-words"
                  style={{
                    background: isOwn
                      ? "rgba(255,255,255,0.2)"
                      : theme === "dark"
                        ? "#4b5563"
                        : "#d1d5db",
                    color: isOwn
                      ? "#fff"
                      : theme === "dark"
                        ? "#e5e7eb"
                        : "#111827",
                    borderLeft: `3px solid ${isOwn ? "#fff" : "var(--primary)"}`,
                  }}
                >
                  {isOwn
                    ? `${msg.replyTo.senderName} : ${msg.replyTo.text || "Media"}`
                    : `${msg.replyTo.senderName} : ${msg.replyTo.text || "Media"}`}
                </div>
              )}

              {/* MESSAGE CONTENT */}
              <div className={`px-3 py-0.5 ${!isMedia ? "pr-14" : "p-0"} flex flex-col`}>
                {!isOwn && !isMedia && (
                  <div className="text-xs font-semibold mb-1" style={{ color: theme === "dark" ? "#D1D5DB" : "#111827" }}>
                    {msg.senderName}
                  </div>
                )}
                {msg.text && (
                  <div className="text-sm leading-snug whitespace-pre-wrap mb-1">{msg.text}</div>
                )}
                {msg.file && (
                  <div className="relative mt-1">
                    {msg.fileType === "image" ? (
                      <img
                        src={msg.file}
                        alt="sent"
                        className="rounded-lg max-w-full cursor-pointer"
                        onClick={() => {
                          setLightboxMedia(msg.file);
                          setLightboxType("image");
                          setLightboxLoading(true);
                        }}
                      />
                    ) : (
                      <video controls className="rounded-lg max-w-full">
                        <source src={msg.file} type={msg.fileType} />
                      </video>
                    )}
                    <div className="absolute bottom-1 right-1 text-[10px] select-none px-1 py-[1px] rounded bg-black/40 text-white">
                      {msg.time}
                    </div>
                  </div>
                )}
              </div>

              {/* TIME */}
              {!isMedia && (
                <div className="absolute text-[8.8px] bottom-1 right-2 select-none" style={{ color: theme === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}>
                  {msg.time}
                </div>
              )}

              {/* BUBBLE TAIL */}
              {!isMedia && (
                <div
                  className="absolute bottom-0"
                  style={
                    isOwn
                      ? { right: "-2px", width: 10, height: 0, borderTop: "8px solid transparent", borderLeft: `8px solid var(--primary)`, transform: "translateY(-2px)" }
                      : { left: "-2px", width: 10, height: 0, borderTop: "8px solid transparent", borderRight: `8px solid ${theme === "dark" ? "#374151" : "#E5E7EB"}`, transform: "translateY(-2px)" }
                  }
                />
              )}

              {/* COPY / DELETE POPUP */}
              {showDeletePopupId === msg.time && (
                <div
                  className={`absolute z-50 w-[160px] rounded-2xl shadow-lg px-1 py-1 select-none 
                    ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"}`}
                  style={{
                    top: "-65px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45
                      ${theme === "dark" ? "bg-gray-800 border-l border-t border-gray-700" : "bg-white border-l border-t border-gray-300"}`}
                  ></div>

                  <button
                    onClick={() => {
                      const textToCopy = msg.text || "";
                      if (!textToCopy) return;

                      if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(textToCopy).then(() => {
                          setShowDeletePopupId(null);
                        });
                      } else {
                        const textArea = document.createElement("textarea");
                        textArea.value = textToCopy;
                        textArea.style.position = "fixed";
                        textArea.style.top = "-9999px";
                        textArea.style.left = "-9999px";
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                          document.execCommand("copy");
                        } catch {
                          alert("Failed to copy message");
                        }
                        document.body.removeChild(textArea);
                        setShowDeletePopupId(null);
                      }
                    }}
                    className={`flex items-center w-full px-3 py-2 mb-1 rounded-xl text-sm transition duration-150
                      ${theme === "dark" ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"}`}
                  >
                    <span className="mr-2">Copy</span> Copy
                  </button>

                  {isOwn && (
                    <button
                      onClick={async () => {
                        try {
                          const chatId = [user.uid, selectedUser.uid].sort().join("_");
                          const chatRef = ref(db, `privateChats/${chatId}`);
                          const snap = await get(chatRef);
                          const data = snap.val();
                          if (!data) return;

                          const key = Object.keys(data).find(
                            (k) => data[k].senderUid === user.uid && data[k].time === msg.time
                          );

                          if (key) {
                            await deleteMessage(key);
                          }
                        } catch (error) {
                          console.error("Failed to delete message:", error);
                        } finally {
                          setShowDeletePopupId(null);
                        }
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-xl text-sm transition duration-150
                        ${theme === "dark" ? "text-red-400 hover:bg-gray-700" : "text-red-500 hover:bg-red-100"}`}
                    >
                      <span className="mr-2">Delete</span> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* === WHATSAPP-STYLE TYPING BUBBLE === */}
      {otherTyping && (
        <div className="flex justify-start px-3 my-1">
          <div
            className="relative max-w-[80%] sm:max-w-[70%] break-words"
            style={{
              background: theme === "dark" ? "#374151" : "#E5E7EB",
              color: theme === "dark" ? "#fff" : "#000",
              borderRadius: 16,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              padding: "10px 14px",
            }}
          >
            <div className="flex gap-1 items-center">
              <span className="typing-bubble" />
              <span className="typing-bubble" />
              <span className="typing-bubble" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef}></div>

      {/* LIGHTBOX */}
      {lightboxMedia &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setLightboxMedia(null)}>
            {lightboxLoading && <div className="text-white text-sm animate-pulse">Loading...</div>}
            {lightboxType === "image" && (
              <img src={lightboxMedia} alt="Preview" className={`max-h-[90vh] max-w-[90vw] ${lightboxLoading ? "hidden" : "block"}`} onLoad={() => setLightboxLoading(false)} />
            )}
            {lightboxType === "video" && (
              <video controls className="max-h-[90vh] max-w-[90vw]" onLoadedData={() => setLightboxLoading(false)}>
                <source src={lightboxMedia} type="video/mp4" />
              </video>
            )}
          </div>,
          document.body
        )}
      <div ref={messagesEndRef}></div>
    </div>

    {/* REPLYING TO */}
    {replyingTo && (
      <div className="flex justify-between items-center px-3 py-2 mb-1 rounded-md bg-gray-900 text-white sticky bottom-[52px] shadow-md border-t-2 border-gray-800">
        <div className="text-xs truncate max-w-[80%] whitespace-pre-wrap">
          {replyingTo.senderUid === user.uid ? (
            <>
              Replying to yourself<br />
              {replyingTo.text || "Media"}
            </>
          ) : (
            <>
              Replying to {replyingTo.senderName}<br />
              {replyingTo.text || "Media"}
            </>
          )}
        </div>
        <button onClick={() => setReplyingTo(null)} className="text-xs font-bold px-1">
          X
        </button>
      </div>
    )}

    {/* INPUT BAR */}
    <div className="sticky bottom-0 bg-gray-800 flex items-center p-2 transition-all duration-300" style={{ background: "transparent", color: "var(--muted)" }}>
      <div className="flex items-center w-full relative transition-all duration-300 ease-in-out">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*,video/*"
          onChange={sendFile}
        />

        <input
          id="messageInput"
          type="text"
          className="p-2.5 pl-5 pr-16 rounded-full outline-none w-full transition-all duration-300"
          placeholder="Message"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setInputValue(e.target.value);

            // SEND TYPING STATUS TO FIREBASE
            if (!user || !selectedUser) return;
            const chatId = [user.uid, selectedUser.uid].sort().join("_");
            const typingRef = ref(db, `typing/${chatId}/${user.uid}`);
            set(typingRef, e.target.value.length > 0 ? true : null);
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          onFocus={() => {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }}
          style={{
            background: theme === "light" ? "#e5e7eb" : "#374151",
            color: theme === "light" ? "#000" : "#fff",
          }}
        />

        {!text.trim() && (
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute right-2 rounded-full p-2 animate-galleryIn"
            style={{ background: "transparent", color: "var(--muted)" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l4-4 4 4 4-4 4 4v8H3v-8z" />
            </svg>
          </button>
        )}

        {text.trim() && (
          <button
            onClick={sendMessage}
            className="absolute right-2 rounded-full p-2 animate-slideIn"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <svg className="w-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 19.5l15-7.5-15-7.5v5.25l9 2.25-9 2.25v5.25z" />
            </svg>
          </button>
        )}
      </div>

      {/* ANIMATIONS & TYPING BUBBLE CSS */}
      <style jsx>{`
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(10px) scale(0.8); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slideIn { animation: slideIn 0.35s ease-out forwards; }

        @keyframes galleryIn {
          0% { opacity: 0; transform: translateX(10px) scale(0.8); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-galleryIn { animation: galleryIn 0.35s ease-out forwards; }

        @keyframes bubblePulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.4); }
        }
        .typing-bubble {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: bubblePulse 1.2s ease-in-out infinite;
        }
        .typing-bubble:nth-child(1) { animation-delay: 0s; }
        .typing-bubble:nth-child(2) { animation-delay: 0.2s; }
        .typing-bubble:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
    </div>
  </div>
)}

      {showReels && <ReelsPage onBack={() => setShowReels(false)} />}

      {!selectedUser && !showReels && !settingsPage && (
        <div
          className="fixed bottom-[-8px] left-1/2 transform -translate-x-1/2 w-[420px] flex justify-center items-center py-3 rounded-t-2xl shadow-2xl"
          style={{ background: "var(--panel-bg)" }}
        >
          <div className="absolute top-[8px] left-0 w-full border-t-[1px]" style={{ borderColor: "rgba(148,163,184,0.06)" }}></div>

          <button
            onClick={() => setShowReels(true)}
            className="rounded-full p-1 transition-all"
            style={{ background: "var(--card-bg)", color: "var(--primary)" }}
          >
            <FiVideo size={25} />
          </button>
        </div>
      )}
    </div>
  );
}