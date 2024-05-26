import { useEffect, useState } from "react";
import "../../styles/List.scss";
import Loader from "../../components/Loader";
import Navbar from "../../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setReservationList } from "../../redux/state";
import ListingCard from "../../components/ListingCard";
import Footer from "../../components/Footer"

const ReservationList = () => {
  const [loading, setLoading] = useState(true);
  const reservationList = useSelector((state) => state.app.userInfo.reservationList);

  const dispatch = useDispatch();

  const getReservationList = async () => {
    try {
      const response = await fetch(
        `/api/user/reservations/`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      console.log(data)
      dispatch(setReservationList(data));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Reservation List failed!", err.message);
    }
  };

  useEffect(() => {
    getReservationList();
	//eslint-disable-next-line
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <h1 className="title-list">Your Reservation List</h1>
      <div className="list">
        {reservationList?.map(({ listing, start_date, end_date, total_price, booking=true }) => (
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
			key={listing.id}
          />
        ))}
      </div>
      <Footer />
    </>
  );
};

export default ReservationList;
