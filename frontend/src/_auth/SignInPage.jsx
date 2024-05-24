import { useState, useEffect } from "react";
import "../styles/Login.scss"
import { addUser } from "../redux/state";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LuLoader2 } from "react-icons/lu";
import { toast } from "react-toastify";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userInfo } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch ("/api/user/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      /* Get data after fetching */
      const loggedIn = await response.json();
      console.log(loggedIn)

      if (loggedIn) {
        dispatch (addUser(loggedIn));
        navigate("/");
      }

    } catch (err) {
      console.log("Login failed", err.message);
      toast.error(`Login Failed: ${err.message}`)
    }
    setLoading(false);
  }

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [navigate, userInfo]);

  return (
    <div className="login">
      <div className="login_content">
        <form className="login_content_form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={loading}
            >
              {loading ? (
                <LuLoader2 className="spin" />
              ):
              "Sign In"}
          </button>
        </form>
        <Link to="/register">Don&apos;t have an account? Sign Up Here</Link>
      </div>
    </div>
  );
};

export default SignInPage;
