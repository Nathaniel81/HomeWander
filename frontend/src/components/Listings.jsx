import { useEffect, useState } from "react";
import { categories } from "../constants/data";
import "../styles/Listings.scss";
// import ListingCard from "./ListingCard";
import ListingCard from "./ListingCard";

import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { setListings } from "../redux/state";
// import { useGetListings } from "../lib/react-query/queries";


const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const listings = useSelector((state) => state.app.listings);

  const getFeedListings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        selectedCategory !== "All"
          ? `/api/listings?category=${selectedCategory}`
          : "/api/listings/",
        {
          method: "GET",
        }
      );

      const data = await response.json();
      dispatch(setListings({ listings: data }));
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getFeedListings();
    //eslint-disable-next-line
  }, [selectedCategory]);

  return (
    <>
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${category.label === selectedCategory ? "selected" : ""}`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
          <div className="listings">
            {listings?.map(
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
                booking=false
              }) => (
                <ListingCard
                  key={id}
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
                />
              )
            )}
          </div>
        )}
    </>
  );
};

export default Listings;
