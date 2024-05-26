import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import ListingCard from "../../components/ListingCard";
import Navbar from "../../components/Navbar";
import "../../styles/List.scss";
import { setWishList } from "../../redux/state";

const WishList = () => {
  const wishList = useSelector((state) => state.app.userInfo.wishList);
  const user = useSelector((state) => state.app.userInfo);
  const dispatch = useDispatch();

  const getWishList = async () => {
    if (user) {
      const response = await fetch('/api/user/wish-list/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        dispatch(setWishList(data.wish_list));
      } else {
        toast.error('Failed to update wish list')
        console.error('Failed to update wish list');
      }
    }
    return;
  };

  //eslint-disable-next-line
  useEffect(() => { getWishList(); }, [])

  return (
    <>
      <Navbar />
      <h1 className="title-list">Your Wish List</h1>
      <div className="list">
        {wishList?.map(
          ({
            id,
            creator,
            listing_photo_paths,
            city,
            province,
            country,
            category,
            type,
            price,
            booking = false,
          }) => (
            <ListingCard
              listingId={id}
              creator={creator}
              listingPhotoPaths={listing_photo_paths}
              city={city}
              province={province}
              country={country}
              category={category}
              type={type}
              price={price}
              booking={booking}
              key={id}
            />
          )
        )}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
