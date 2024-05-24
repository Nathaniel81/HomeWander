import { Menu, Person, Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetUser } from "../redux/state";
import "../styles/Navbar.scss";
import '../styles/variables.scss';


const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);

  const user = useSelector((state) => state.user.userInfo);

  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/user/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.log(error);
      toast.error('Network response was not ok');
    }
    dispatch(resetUser());
  };

  const getCssVariable = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
  };

  const pinkred = getCssVariable('--pinkred');
  const darkgrey = getCssVariable('--darkgrey');

  const handleSearch = () => {
    if (search !== '') {
      navigate(`/properties/search/${search}`);
    }
  }
  
  return (
    <div className="navbar">
      <Link to="/">
        <img src="/assets/logo.png" alt="logo" />
      </Link>

      <div className="navbar_search">
        <input
          type="text"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton disabled={search === ""}>
          <Search
            sx={{ color: pinkred }}
            onClick={handleSearch}
          />
        </IconButton>
      </div>

      <div className="navbar_right">
        {user ? (
          <Link to="/create-listing" className="host">
            Become A Host
          </Link>
        ) : (
          <Link to="/sign-in" className="host">
            Become A Host
          </Link>
        )}

        <button
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: darkgrey }} />
          {!user ? (
            <Person sx={{ color: darkgrey }} />
          ) : (
            <img
              src={user?.profile_picture}
              alt="profile photo"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        </button>

        {dropdownMenu && !user && (
          <div className="navbar_right_accountmenu">
            <Link to="/sign-in">Log In</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        )}

        {dropdownMenu && user && (
          <div className="navbar_right_accountmenu">
            <Link to={`/${user?.id}/trips`}>Trip List</Link>
            <Link to={`/${user?.id}/wishList`}>Wish List</Link>
            <Link to={`/${user?.id}/properties`}>Property List</Link>
            <Link to={`/${user?.id}/reservations`}>Reservation List</Link>
            <Link to="/create-listing">Become A Host</Link>

            <Link
              to="/login"
              onClick={() => handleSignOut()}
            >
              Log Out
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;