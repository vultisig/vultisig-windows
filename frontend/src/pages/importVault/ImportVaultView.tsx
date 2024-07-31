import React, { useState } from "react";

const ImportVaultView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [passwd, setPasswd] = useState("");
  const [isContinue, setContinue] = useState(false);

  const onUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";

    fileInput.addEventListener("change", (event) => {
      if (event.target) {
        setSelectedFile(event.target.files[0]);
        if (event.target.files[0] !== "") {
          return;
        }
        const reader = new FileReader();

        reader.onload = () => {
          const data = reader.result;
          if (data) {
            // verify if data is valid
            setFileContent(data.toString());
          }
        };

        reader.readAsText(event.target.files[0]);
      }
    });

    fileInput.click();
  };

  return (
    <>
      <div className="text-white pt-[10vh]">
        <div className="text-center px-20">
          <h6 className="text-lg mb-8">
            Enter your previously created vault share
          </h6>
          <div
            className="w-full bg-[#33E6BF]/[.14] h-[250px] border-2 border-dashed border-[#33E6BF] rounded-lg font-bold cursor-pointer"
            onClick={onUpload}
          >
            <img
              src="/assets/images/file.svg"
              className="mx-auto mb-4 mt-20"
              alt="file"
            />
            Upload backup file
          </div>
          {selectedFile && fileContent && (
            <div className="flex justify-between mt-8">
              <div className="flex">
                <img
                  src="/assets/images/file.svg"
                  className="ml-4 mr-2 w-6"
                  alt="file"
                />
                {selectedFile.name}
              </div>
              <img
                src="/assets/images/cancel.svg"
                className="mr-4 w-4"
                alt="cancel"
              />
            </div>
          )}
          <button
            className={`text-lg rounded-full w-full font-bold py-2 mt-48 ${
              isContinue
                ? "text-[#061B3A] bg-[#33E6BF]"
                : "text-[#BDBDBD] bg-white/[.10]"
            }`}
            disabled={!isContinue}
            onClick={() => {
              console.log("test");
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default ImportVaultView;
