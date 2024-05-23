import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"
import "../styles/Register.scss"
import { toast } from "react-toastify";
import { addUser } from "../redux/state";
import { useDispatch, useSelector } from "react-redux";
import { LuLoader2 } from "react-icons/lu";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      [name]: name === "profile_picture" ? files[0] : value,
    });
  };

  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    setPasswordMatch(formData.password === formData.confirmPassword || formData.confirmPassword === "");
	//eslint-disable-next-line
  }, []);

  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if(userInfo) navigate('/');
  }, [userInfo, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      const register_form = new FormData();
  
      for (const key in formData) {
        register_form.append(key, formData[key]);
      }
  
      const response = await fetch("/api/user/register/", {
        method: "POST",
        body: register_form
      });
  
      if (response.ok) {
        const data = await response.json();
        dispatch(addUser(data))
        navigate("/");
      } else {
        // console.error(`Error: ${response.status} - ${response.statusText}`);
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error(errorData.error);
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    } catch (err) {
      console.error("Registration failed", err.message);
      toast.error("Registration failed");
    }
    setLoading(false);
  };
  

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input
            placeholder="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />

          {!passwordMatch && (
            <p style={{ color: "red" }}>Passwords are not matched!</p>
          )}

          <input
            id="image"
            type="file"
            name="profile_picture"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
            required
          />
          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="add profile photo" />
            <p>Upload Your Photo</p>
          </label>

          {formData.profile_picture && (
            <img
              src={URL.createObjectURL(formData.profile_picture)}
              alt="profile photo"
              style={{ maxWidth: "80px" }}
            />
          )}
          <button 
            type="submit" 
            disabled={!passwordMatch || loading}>
              {loading ? (
                <LuLoader2 className="spin" />
              ):
              "Register"}
          </button>
        </form>
        <Link to={"/sign-in"}>Already have an account? Log In Here</Link>
      </div>
    </div>
  );
};

export default RegisterPage;