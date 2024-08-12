import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserOpenURL } from '../../../wailsjs/runtime';

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
    <nav className="bg-primary text-white p-4 flex justify-between items-center border-b border-gray-400">
      <button
        className="bg-transparent"
        onClick={() => {
          if (handleBack) {
            handleBack();
          } else {
            navigate(-1);
          }
        }}
      >
        <img
          src="/assets/images/icons/caretLeft.svg"
          alt="Back"
          className="cursor-pointer"
        />
      </button>

      <h1 className="text-xl font-bold">{title}</h1>
      <button className="bg-transparent" onClick={openHelp}>
        <img
          src="/assets/images/icons/question.svg"
          alt="Question"
          className={questionLink ? 'cursor-pointer' : 'invisible'}
        />
      </button>
    </nav>
  );
};

export default NavBar;
