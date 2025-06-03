import { Avatar, Button } from "antd";
import React, { useState, useEffect } from "react";

import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupMembers from "./GroupMembers";
import MessageChat from "./MessageChat";

import { motion, AnimatePresence } from "framer-motion";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Input, DatePicker } from "antd";
import Auto_comp from "../../../maps/Auto_comp";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../../store/user";
import { setLoading } from "../../../store/isload";
import { setbucket, setfeed, setPolyline } from "../../../store/bucket";
import { group_place } from "../../../store/group";
import Mapview from "../Mapview";
import { useNavigate } from "react-router";
import GroupSidebar from "./GroupSidebar";

export default function Group() {
  const [activeButton, setActiveButton] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showAutoComp, setShowAutoComp] = useState(false);

  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    olat: "",
    olon: "",
    destination: "",
    dlat: "",
    dlon: "",
    ocord: "",
    dcord: "",
    startDate: null,
    endDate: null,
  });
  const [top100Films, setTop100Films] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [payload, setPayload] = useState(null); // Updated name from `setpa` to `setPayload`

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    if (e.target) {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelect = (field, selected) => {
    setFormData((prevData) => ({ ...prevData, [field]: selected }));
  };

  const handleSubmit = async () => {
    const newGroup = {
      origin: formData.origin,
      olat: formData.olat,
      olon: formData.olon,
      destination: formData.destination,
      dlat: formData.dlat,
      dlon: formData.dlon,
      startDate: formData.startDate
        ? formData.startDate.format("YYYY-MM-DD")
        : null,
      endDate: formData.endDate ? formData.endDate.format("YYYY-MM-DD") : null,
    };

    console.log(formData);
    const updatedTop100Films = [...top100Films, newGroup];
    setTop100Films(updatedTop100Films);
    setFilteredGroups(updatedTop100Films);

    try {
      await axios.post(
        `${window._env_.REACT_APP_BASE_URL}/bucketlist/putdata/`,
        { bucket: formData },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      // alert('Group data submitted successfully');
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Error submitting data");
    }

    handleClose();
  };

  const handleRemove = async (index) => {
    const removedItem = top100Films[index];
    console.log("Removed item:", removedItem);
    const updatedTop100Films = top100Films.filter((_, i) => i !== index);
    setTop100Films(updatedTop100Films);
    setFilteredGroups(updatedTop100Films);

    try {
      await axios.post(
        `${window._env_.REACT_APP_BASE_URL}/bucketlsit/DeleteBucketElement`,
        {
          token: sessionStorage.getItem("token"),
          bucket: removedItem,
        }
      );
      // alert('Group data removed successfully');
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Error submitting data");
    }
  };
  const [selected_bucket, setsel_bucket] = useState(null);
  const handleAutocompleteSelect = async (value) => {
    console.log("Selected autocomplete option:", value);
    dispatch(group_place(value));
    dispatch(setLoading(true));

    const ocord = value.ocord; // WKT format for origin
    const dcord = value.dcord; // WKT format for destinationcur
    const radius = 10000;

    const origin = `${value.olat},${value.olon}`;
    const destination = `${value.dlat},${value.dlon}`;

    const url = `https://api.olamaps.io/routing/v1/directions?origin=${origin}&destination=${destination}&alternatives=false&steps=true&overview=full&language=en&traffic_metadata=false&api_key=MdsBLQtub1D2n4KEMKHXyHggjA89vCj0RIJbx2YH`;

    try {
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPayload(""); // Clear previous payload

      //  Directly use the routing data in the axios request
      const polyline = data.routes[0].overview_polyline;
      // console.log("aa", polyline);
      dispatch(setPolyline(polyline));
      setsel_bucket({ ocord, dcord, radius, polyline });
    } catch (e) {
      console.log(e);
    }

    dispatch(setLoading(false));
    setSelectedOption(value);
  };

  const user = useSelector((state) => state.user.user);
  useEffect(() => {
    if (!user) {
      // Fetch user data if not already present in Redux
      dispatch(fetchUserData());
    }
    const data =
      user.bucketlist.map((item) => {
        const extractCoordinates = (coordString) => {
          if (!coordString) return { lat: null, lon: null }; // Return nulls if input is invalid
          const match = coordString.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
          return match
            ? { lon: parseFloat(match[2]), lat: parseFloat(match[1]) } // Extract longitude and latitude
            : { lat: null, lon: null };
        };

        const originCoords = extractCoordinates(item.ocord);
        const destinationCoords = extractCoordinates(item.dcord);

        return {
          origin: item.origin,
          olat: originCoords.lat,
          olon: originCoords.lon,
          destination: item.destination,
          dlat: destinationCoords.lat,
          dlon: destinationCoords.lon,
          startDate: item.start_date,
          name: item.bucket,
          endDate: item.end_date,
          id: item.id,
          ocord: item.ocord,
          dcord: item.dcord,
        };
      }) || []; // Default to an empty array if user.bucketlist is undefined

    console.log(data);
    setTop100Films(data);
    setFilteredGroups(data);
  }, [dispatch, user]);
  console.log("dda", top100Films);
  useEffect(() => {
    const filtered = top100Films.filter(
      (group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGroups(filtered);

    if (searchTerm.length > 2 && filtered.length === 0) {
      setShowAutoComp(true);
    } else {
      setShowAutoComp(false);
    }
  }, [searchTerm, top100Films]);


  const [communityData, setCommunityData] = useState({
    name: "",
    lat: null,
    lng: null,
  });
  const handleCommunitySelect = (name, { lat, lng }) => {
    setCommunityData({ name, lat, lng });
    setShowAutoComp(false);
    console.log(communityData);
    
    setSearchTerm("");
  };

  return (
    <div className="p-3 w-full flex flex-col">

      <div className="flex flex-col lg:flex-row w-full gap-2 ">
        <div
          className={`pt-2 lg:h-[96vh] w-full ${
            showAutoComp ? "lg:w-[28%]" : "lg:w-[8%]"
          } bg-white/50 border rounded-3xl flex flex-row lg:flex-col items-center justify-start text-center overflow-x-auto lg:overflow-y-auto`}
        >
          {" "}
          <div className=" w-full flex lg:gap-3 gap-1 flex-row lg:flex-col items-center justify-start text-center px-2">
            <IconButton
              className={`w-14 h-14 rounded-full transition-colors duration-300 ${
                activeButton === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={handleOpen}
            >
              <AddIcon size={50} />
            </IconButton>

            <div className="w-full flex flex-col items-center">
              {showAutoComp ? (
                <div className="w-full">
                  <div className="w-full">
                    <Auto_comp
                      onSelect={(selected, loc) => {
                        handleCommunitySelect(selected, { lat: loc.lat, lng: loc.lng });
                        // handleSelect("origin", selected);
                        // handleSelect("olat", loc.lat);
                        // handleSelect("olon", loc.lng);
                        // setShowAutoComp(false);
                        // setSearchTerm(""); // Clear the input
                      }}
                      initialText={searchTerm}
                    />
                    <Button
                      type="link"
                      onClick={() => {
                        setShowAutoComp(false);
                        setSearchTerm("");
                      }}
                      className="text-blue-500 mt-1"
                    >
                      Back to Search
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  placeholder="Search..."
                  className="w-32 lg:w-4/5"
                  value={searchTerm}
                  onChange={(e) => {
                    const term = e.target.value;
                    setSearchTerm(term);
                    const filtered = top100Films.filter(
                      (group) =>
                        group.name.toLowerCase().includes(term.toLowerCase()) ||
                        group.origin
                          .toLowerCase()
                          .includes(term.toLowerCase()) ||
                        group.destination
                          .toLowerCase()
                          .includes(term.toLowerCase())
                    );
                    setFilteredGroups(filtered);
                    setShowAutoComp(term.length > 2 && filtered.length === 0);
                  }}
                />
              )}
            </div>

            {filteredGroups.map((group, index) => (
              <Tooltip
                key={group.id || index}
                title={
                  <div className="text-sm text-white p-2">
                    <div className="font-bold text-lg">{group.name}</div>
                    <div>
                      <b>Origin:</b> {group.origin}
                    </div>
                    <div>
                      <b>Destination:</b> {group.destination}
                    </div>
                    <div>
                      <b>Start Date:</b> {group.startDate}
                    </div>
                    <div>
                      <b>End Date:</b> {group.endDate}
                    </div>
                  </div>
                }
                placement="top"
              >
                <Button
                  className={`w-12 h-12 rounded-full text-lg mb-2 flex items-center justify-center transition-colors duration-300 ${
                    activeButton === group.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => {
                    setActiveButton(group.id);
                    handleAutocompleteSelect(group);
                  }}
                >
                  {group?.name
                    ? group.name.substring(0, 2).toUpperCase()
                    : "NA"}
                </Button>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="flex flex-1 w-full h-[96vh]">
          <GroupMembers selected_bucket={selected_bucket} />
        </div>

        {/* Dialog */}
        <AnimatePresence>
          {open && (
            <Dialog
              open={open}
              onClose={handleClose}
              PaperComponent={motion.div}
              PaperProps={{
                initial: { scale: 0 },
                animate: { scale: 1 },
                exit: { scale: 0 },
                transition: { duration: 0.5 },
                className:
                  "bg-opacity-80 bg-black text-white rounded-2xl w-full",
              }}
            >
              <DialogTitle className="bg-black text-white text-2xl">
                Fill the details of the Group
              </DialogTitle>
              <DialogContent className="bg-black text-white w-full">
                <div className="text-white space-y-4 mb-4 text-lg">
                  <div className="relative z-50">
                    <p>Start and End Dates:</p>
                    <div className="flex gap-4 flex-wrap">
                      <DatePicker
                        value={formData.startDate}
                        onChange={(date) => handleDateChange("startDate", date)}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        className="z-50 w-full sm:w-1/2"
                      />
                      <DatePicker
                        value={formData.endDate}
                        onChange={(date) => handleDateChange("endDate", date)}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        className="z-50 w-full sm:w-1/2"
                      />
                    </div>
                  </div>
                  <div>
                    <p>Name of Group:</p>
                    <Input
                      placeholder="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <p>Origin:</p>
                    <Auto_comp
                      onSelect={(selected, loc) => {
                        handleSelect("origin", selected);
                        handleSelect("olat", loc.lat);
                        handleSelect("olon", loc.lng);
                      }}
                    />
                  </div>
                  <div>
                    <p>Destination:</p>
                    <Auto_comp
                      onSelect={(selected, loc) => {
                        handleSelect("destination", selected);
                        handleSelect("dlat", loc.lat);
                        handleSelect("dlon", loc.lng);
                      }}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  className="mt-4"
                >
                  Submit
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>

      {/* Mapview */}
      <div className="flex w-full mt-4">
        <Mapview />
      </div>
    </div>
  );
}
