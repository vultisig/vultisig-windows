import React from "react";
import { useNavigate } from "react-router-dom";
import { BrowserOpenURL } from "../../../wailsjs/runtime";

interface NavBarProps {
  title: string;
  questionLink?: string;
  handleBack?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ title, questionLink, handleBack }) => {
  const navigate = useNavigate();

  const openHelp = () => {
    if (questionLink) {
      BrowserOpenURL(questionLink);
    }
  };

  return (
    <nav className="bg-[#02122B] text-white p-4 flex justify-between items-center border-b border-gray-400">
      <img
        src="/assets/images/caretLeft.svg"
        alt="Back"
        onClick={() => {
          if (handleBack) {
            handleBack();
          } else {
            navigate(-1);
          }
        }}
        className="cursor-pointer"
      />
      <h1 className="text-xl font-bold">{title}</h1>
      <img
        src="/assets/images/question.svg"
        alt="Question"
        onClick={openHelp}
        className={questionLink ? "cursor-pointer" : "invisible"}
      />
    </nav>
  );
};

export default NavBar;
