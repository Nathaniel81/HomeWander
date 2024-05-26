import { useEffect, useState } from "react";
import "../../styles/List.scss";
import Loader from "../../components/Loader";
import Navbar from "../../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../../redux/state";
import ListingCard from "../../components/ListingCard";
import Footer from "../../components/Footer"

const TripList = () => {
  const [loading, setLoading] = useState(true);
  const tripList = useSelector((state) => state.app.userInfo.tripList);

  const dispatch = useDispatch();

  const getTripList = async () => {
    try {
      const response = await fetch(
        `/api/bookings/`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      dispatch(setTripList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Trip List failed!", err.message);
    }
  };

  useEffect(() => {
    getTripList();
	//eslint-disable-next-line
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList?.map(({ listing, start_date, end_date, total_price, booking=true }) => (
          <ListingCard
            listingId={listing.id}
            listingPhotoPaths={listing.listing_photo_paths}
            city={listing.city}
            province={listing.province}
            country={listing.country}
            category={listing.category}
            startDate={start_date}
            endDate={end_date}
            totalPrice={total_price}
            booking={booking}
            key={tripList.id}
          />
        ))}
      </div>
      <Footer />
    </>
  );
};

export default TripList;
