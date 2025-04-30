import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Button, Input } from "antd";

export default function GroupSidebar({
  activeButton,
  setActiveButton,
  handleOpen,
  searchTerm,
  setSearchTerm,
  filteredGroups,
  handleAutocompleteSelect,
}) {
  return (
<div className="pt-2 lg:h-[96vh] w-full lg:w-[8%] bg-white/50 border rounded-3xl flex flex-row lg:flex-col items-center justify-start text-center overflow-x-auto lg:overflow-y-auto">
      {/* <div className="hidden lg:block w-[70%] h-1 bg-gray-400 rounded-full mt-3 mb-3"></div> */}

      <div className="flex lg:gap-3 gap-1 flex-row lg:flex-col items-center justify-start text-center px-2">
        <IconButton
          className={`w-14 h-14 rounded-full transition-colors duration-300 ${
            activeButton === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={handleOpen}
        >
          <AddIcon size={50} />
        </IconButton>

        <Input
          placeholder="Search..."
          className="mb-3 w-32 lg:w-4/5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredGroups.map((group, index) => (
          <Tooltip
            key={group.id || index}
            title={
              <div className="text-sm text-white p-2">
                <div className="font-bold text-lg">{group.name}</div>
                <div><b>Origin:</b> {group.origin}</div>
                <div><b>Destination:</b> {group.destination}</div>
                <div><b>Start Date:</b> {group.startDate}</div>
                <div><b>End Date:</b> {group.endDate}</div>
              </div>
            }
            placement="top"
          >
            <Button
              className={`w-12 h-12 rounded-full text-lg mb-2 flex items-center justify-center transition-colors duration-300 ${
                activeButton === group.id ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => {
                setActiveButton(group.id);
                handleAutocompleteSelect(group);
              }}
            >
              {group?.name ? group.name.substring(0, 2).toUpperCase() : "NA"}
            </Button>
          </Tooltip>
        ))}
       
      </div>
    </div>
  );
}
