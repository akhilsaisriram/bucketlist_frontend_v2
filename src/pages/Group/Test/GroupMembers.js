import React, { useEffect, useMemo, useState } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Input,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  CssBaseline,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { Avatar, Button, Tabs } from "antd";
import GroupsIcon from "@mui/icons-material/Groups";
import { useNavigate, useOutletContext } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import MessageChat from "./MessageChat";
import axios from "axios";
import { setbucket, setfeed } from "../../../store/bucket";
import { setLoading } from "../../../store/isload";
import {
  AddIcCallOutlined,
  Key,
  MoreVert,
  Settings,
} from "@mui/icons-material";
import Settingsa from "./Settings";
import AddIcon from "@mui/icons-material/Add";

const GroupMembers = ({ selected_bucket = {} }) => {
  const { ocord, dcord, radius, polyline } = selected_bucket || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [group, setGroup] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);
  const { isDarkMode } = useOutletContext();

  const fetchGroups = async (pageNumber) => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${window._env_.REACT_APP_BASE_URL}/bucketlist/nearbypagination/`,
        { ocord, dcord, radius, polyline, page: pageNumber },
        { headers }
      );
      console.log("====================================");
      console.log(response.data);
      console.log("====================================");
      setTotalPages(response.data.count / 10);
      const bucketPeople = response.data?.results?.bucket || [];
      const bucketFeed = response.data?.results?.feed || [];

      const allBuckets = [
        ...(response.data?.results?.bucket || []),
        ...(response.data?.results?.services || []),
      ];

      // setGroup(bucketPeople);
      setGroup(allBuckets);

      dispatch(setbucket(bucketPeople));
      dispatch(setfeed(bucketFeed));
      dispatch(setLoading(false));
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchGroups(page);
  }, [page, ocord, dcord, radius, polyline]);

  const filterList = (list, keys) =>
    list.filter((item) =>
      keys.some((key) => {
        const value = key
          .split(".")
          .reduce((obj, keyPart) => obj?.[keyPart], item);
        return value?.toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  const [key, setkey] = useState(2);

  // const filteredGroups = useMemo(
  //   () =>
  //     filterList(Array.isArray(group) ? group : [], [
  //       "uid.username",
  //       "origin",
  //       "destination",
  //     ]),
  //   [group, searchQuery,key]
  // );
const filteredGroups = useMemo(() => {
  const validGroups = Array.isArray(group) ? group : [];

  let filteredByKey = [];

  if (key === 1) {
    filteredByKey = validGroups.filter((item) => item.type === "service");
  } else if (key === 2) {
    filteredByKey = validGroups.filter((item) => item.type === "group");;
  }

  return filterList(filteredByKey, ["uid.username", "origin", "destination"]);
}, [group, searchQuery, key]);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectPerson = (person) => {
    console.log("====================================");
    console.log(person);
    console.log("====================================");
    if (!person) return;
    if (person?.type === "service") {
      setSelectedPerson({
        uid: person.userid.id || "",
        name: person.userid.username || "Unknown",
      });
    } else {
      setSelectedPerson({
        uid: person.uid.id || "",
        name: person.uid.username || "Unknown",
      });
    }
  };

  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  const onChange = (l) => {
    setkey(l);
    console.log(l);
  };
  const items = [
    {
      key: 2,
      label: "Group",
    },
    {
      key: 1,
      label: "Services",
    },
  ];
  const [hoveredService, setHoveredService] = useState(null);

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden gap-1">
      {/* Sidebar */}
      <div className="flex flex-col items-center justify-start w-full md:w-[40%] lg:w-[25%] xl:w-[35%] h-full bg-white/50 border rounded-3xl p-4">
        {/* Header */}
        <div className="flex flex-row items-center justify-between w-full mb-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
          <IconButton onClick={handleOpenSettings}>
            <Settings />
          </IconButton>
          <Settingsa open={openSettings} onClose={handleCloseSettings} />
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full space-y-2 mb-2">
          <div className="flex flex-row justify-between items-center w-full">
            {/* <span className="text-lg font-semibold">Groups</span> */}
            <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
            <IconButton className="bg-gray-200 text-white rounded-full">
              <AddIcon />
            </IconButton>
          </div>
          <Button className="rounded-full bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 hover:shadow-lg transform hover:scale-105 transition">
            Community
          </Button>
        </div>

        {/* List */}
        <List
          sx={{
            overflowY: "auto",
            width: "100%",
            flexGrow: 1,
            maxHeight: "calc(100vh - 300px)",
          }}
        >
          {filteredGroups.length > 0 ? (
            filteredGroups.map((item, index) => {
       
       
               return (
              <Tooltip
                key={index}
                title={
                  item.visble !== 0 ? (
                    <>
                      <div>
                        <strong>Origin:</strong> {item.origin || "Unknown"}
                      </div>

                      {item.type === "service" ? (
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Service Name:</strong>{" "}
                            {item.service_name || "Unknown"}
                          </div>
                          <div>
                            <strong>Service Type:</strong>{" "}
                            {item.servicetype || "Unknown"}
                          </div>
                          <div>
                            <strong>Description:</strong>{" "}
                            {item.discription || "None"}
                          </div>
                          <div>
                            <strong>Available Days:</strong>{" "}
                            {item.available_days?.join(", ") || "Not specified"}
                          </div>

                          <div>
                            <strong>Contact 1:</strong>{" "}
                            {item.contact_number1 || "N/A"}
                          </div>
                          {item.contact_number2 && (
                            <div>
                              <strong>Contact 2:</strong> {item.contact_number2}
                            </div>
                          )}
                          <div>
                            <strong>Origin:</strong> {item.origin || "Unknown"}
                          </div>
                          {item.destination && (
                            <div>
                              <strong>Destination:</strong> {item.destination}
                            </div>
                          )}
                          <div>
                            <strong>Distance to You:</strong>{" "}
                            {item.distance_to_dcord?.toFixed(2)} km
                          </div>
                          <div>
                            <strong>Likes:</strong> {item.likes}
                          </div>
                          <div>
                            <strong>Dislikes:</strong> {item.dislikes}
                          </div>
                          <div>
                            <strong>Created At:</strong>{" "}
                            {new Date(item.created_at).toLocaleString()}
                          </div>
                          {item.media?.length > 0 && (
                            <div className="pt-2">
                              <strong>Media:</strong>
                              <img
                                src={item.media[0]}
                                alt="Service"
                                className="mt-1 rounded-md max-w-full max-h-48 object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong>Destination:</strong>{" "}
                            {item.destination || "Unknown"}
                          </div>
                          <div>
                            <strong>Start:</strong>{" "}
                            {dayjs(item.start_date).format("DD/MM/YYYY")}
                          </div>
                          <div>
                            <strong>End:</strong>{" "}
                            {dayjs(item.end_date).format("DD/MM/YYYY")}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    ""
                  )
                }
                arrow
              >
                <ListItemButton onClick={() => handleSelectPerson(item)}>
                  <ListItemAvatar>
                    <Avatar>
                      {item.uid?.username
                        ? item.uid.username.charAt(0).toUpperCase()
                        : "P"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      item.type === "service"
                        ? item.userid?.username || "Unknown"
                        : item.uid?.username || "Unknown"
                    }
                  />{" "}
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleClick(e)}
                    aria-label="more options"
                  >
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem
                      onClick={() => navigate(`/person/${item.uid?.username}`)}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleClose}>Connect</MenuItem>
                  </Menu>
                </ListItemButton>
              </Tooltip>)
            })
          ) : (
            <div className="text-center w-full py-4 text-gray-500 italic">
              No groups found
            </div>
          )}
        </List>

        {/* Pagination */}
        <div className="flex items-center justify-center w-full mt-4">
          <nav aria-label="Pagination" className="flex items-center space-x-3">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Previous page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200">
              <span className="font-medium text-gray-700">{page}</span>
              <span className="text-gray-500"> / {Math.ceil(totalPages)}</span>
            </div>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Next page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow h-full w-full overflow-hidden">
        <MessageChat selectedPerson={selectedPerson} />
      </div>
      <Dialog open={!!hoveredService} onClose={() => setHoveredService(null)}>
        <DialogTitle>{hoveredService?.service_name}</DialogTitle>
        <DialogContent>
          <div>
            <strong>Type:</strong> {hoveredService?.servicetype}
          </div>
          <div>
            <strong>Origin:</strong> {hoveredService?.origin}
          </div>
          <div>
            <strong>Destination:</strong> {hoveredService?.destination}
          </div>
          <div>
            <strong>Available:</strong>{" "}
            {hoveredService?.available_days?.join(", ")}
          </div>
          <div>
            <strong>Contact:</strong> {hoveredService?.contact_number1}
          </div>
          <div>
            <strong>Description:</strong> {hoveredService?.discription}
          </div>
          {hoveredService?.media?.length > 0 && (
            <img
              src={hoveredService.media[0]}
              alt="Service"
              className="mt-4 w-full max-h-60 object-cover rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupMembers;
