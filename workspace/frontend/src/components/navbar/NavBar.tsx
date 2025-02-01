import React from 'react';

import { BrowserOpenURL } from '../../../wailsjs/runtime';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';

interface NavBarProps {
  title: string;
  questionLink?: string;
  handleBack?: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ title, questionLink, handleBack }) => {
  const goBack = useNavigateBack();

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
            goBack();
          }
        }}
      >
        <img
          src="/assets/icons/caretLeft.svg"
          alt="Back"
          className="cursor-pointer"
        />
      </button>

      <h1 className="text-xl font-bold">{title}</h1>
      <button className="bg-transparent" onClick={openHelp}>
        <img
          src="/assets/icons/question.svg"
          alt="Question"
          className={questionLink ? 'cursor-pointer' : 'invisible'}
        />
      </button>
    </nav>
  );
};

export default NavBar;
