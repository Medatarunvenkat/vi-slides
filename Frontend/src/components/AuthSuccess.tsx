import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AuthSuccess() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/success', {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
          toast.success(`Welcome back, ${data.user.name || 'User'}!`);
          
          // Store user data in localStorage or context
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect based on role
          if (data.user.role === "teacher") {
            navigate("/teacher");
          } else {
            navigate("/student");
          }
        } else {
          toast.error("Authentication failed");
          navigate("/login");
        }
      } catch (error) {
        toast.error("Authentication failed");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleAuthSuccess();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Authenticating...
      </div>
    );
  }

  return null;
}
