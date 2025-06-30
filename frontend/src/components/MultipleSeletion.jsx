"use client";
import React, { useEffect } from "react";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid";

const MultipleSelection = ({
  options,
  handleEndStatesChange,
  symbol,
  state,
  transitions,
  initialSelect,
}) => {
  const [openList, setOpenList] = React.useState(false);
  const [select, setSelected] = React.useState(initialSelect);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenList(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (initialSelect == null) {
      setSelected([]);
      return;
    }
    setSelected(initialSelect);
  }, [initialSelect]);

  useEffect(() => {
    select !== undefined &&
      select.forEach((s) => {
        options?.includes(s) ||
          setSelected((select) => select.filter((item) => item !== s));
      });
  }, [options]);

  React.useEffect(() => {
    if (symbol != null && state != null && transitions != null) {
      handleEndStatesChange(state, symbol, select, transitions);
      return;
    }
    handleEndStatesChange(select);
  }, [select]);

  React.useEffect(() => {
    if (symbol != null && state != null && transitions != null) {
      const selectedStates = transitions?.[state]?.[symbol] || [];
      setSelected(selectedStates);
    }
  }, [state, symbol]);

  function handleSelect(option) {
    setSelected((select) => [...select, option]);
  }

  function unSelect(option) {
    const updatedSelect = select.filter((item) => item !== option);
    setSelected(updatedSelect);
  }
  const active = openList
    ? "ring-2 ring-inset ring-indigo-600"
    : "ring-1 ring-inset ring-gray-300";
  return (
    <div ref={dropdownRef}>
      <div
        onClick={() => {
          setOpenList(!openList);
        }}
        className={`shadow-sm border border-grey-500 rounded-lg flex justify-end p-1 ${active} items-center`}
      >
        <div className="flex-1 p-1 flex flex-inline flex-wrap">
          {select?.map((s, index) => {
            return (
              <span
                key={index}
                className="flex bg-gray-200 rounded-xl pl-2 pr-1 items-center mr-2 my-1"
              >
                <span className="flex-1 mr-3 text-black ">{s}</span>
                <XMarkIcon
                  onClick={() => {
                    unSelect(s);
                  }}
                  className="w-4 bg-gray-400 rounded-xl hover:bg-gray-500"
                />
              </span>
            );
          })}
        </div>
        <XMarkIcon
          onClick={() => {
            setSelected([]);
          }}
          className="font-medium w-5 mx-1 hover:bg-gray-400 rounded-xl text-black"
        />
        <ChevronUpDownIcon className="font-medium w-5 h-8 text-black " />
      </div>
      <ul
        className="p-3 text-md rounded-lg shadow-gray-500/50 shadow-lg max-h-60 overflow-auto"
        style={openList ? { display: "block" } : { display: "none" }}
      >
        {options?.map((option, index) => {
          const isSelected = select?.includes(option);
          const active = isSelected ? "bg-gray-100" : "";
          return (
            <li
              key={index}
              onClick={() => {
                active ? unSelect(option) : handleSelect(option);
              }}
              className={`hover:bg-gray-200 text-black p-1 ${active}`}
            >
              {option}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MultipleSelection;
