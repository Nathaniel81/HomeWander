import { useEffect, useState } from "react";
import "../../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../../constants/data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../../components/Loader";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer"
import { useSelector } from "react-redux";
import { format } from 'date-fns';
import { toast } from "react-toastify";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `/api/listings/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };


  useEffect(() => {
    getListingDetails();
    //eslint-disable-next-line
  }, []);

  /* BOOKING CALENDAR */
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    // Update the selected date range when user makes a selection
    setDateRange([ranges.selection]);
  };

  const startDate = new Date(dateRange[0].startDate);
  const endDate = new Date(dateRange[0].endDate);
  const dayCount = Math.round(endDate - startDate) / (1000 * 60 * 60 * 24); // Calculate the difference in day unit

  const start = format(new Date(dateRange[0].startDate), 'yyyy-MM-dd');
  const end = format(new Date(dateRange[0].endDate), 'yyyy-MM-dd');

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.app?.userInfo?.id);

  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        // customerId,
        listing: listingId,
        host: listing.creator.id,
        start_date: start,
        end_date: end,
        total_price: listing.price * dayCount,
      }

      const response = await fetch("/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm)
      })

      if (response.ok) {
        navigate(`/${customerId}/trips`)
      }
    } catch (err) {
      toast.error('Submit Booking Failed')
      console.log("Submit Booking Failed.", err.message)
    }
  }

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listing_photo_paths?.map((item, index) => (
            <img
              src={item}
              alt="listing photo"
              key={index}
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guest_count} guests - {listing.bedroom_count} bedroom(s) -{" "}
          {listing.bed_count} bed(s) - {listing.bathroom_count} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={listing.creator.profile_picture}
          />
          <h3>
            Hosted by {listing.creator.first_name} {listing.creator.last_name}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlight_desc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              {dayCount > 1 ? (
                <h2>
                  ${listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ${listing.price} x {dayCount} night
                </h2>
              )}

              <h2>Total price: ${listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toDateString()}</p>

              <button className="button" type="submit" onClick={handleSubmit}>
                Booking
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
