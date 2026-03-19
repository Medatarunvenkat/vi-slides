import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import "../styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate("/login");
          return;
        }
        const userData = await authService.getProfile();
        setUser(userData.user);
      } catch (err: any) {
        console.error("Profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Hello, {user?.name || user?.email || "User"}!</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}