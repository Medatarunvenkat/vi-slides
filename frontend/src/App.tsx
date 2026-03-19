import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Student from "./components/student";
import Teacher from "./components/teacher";
import Session from "./components/Session";
import AuthSuccess from "./components/AuthSuccess";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student" element={<Student />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/session/:sessionCode" element={<Session />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}