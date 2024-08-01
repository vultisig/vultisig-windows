import React, { useRef, useState } from "react";
import ImportVaultDialog from "../../components/dialog/ImportVaultDialog";

const ImportVaultView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [isContinue, setContinue] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");

  const handleUpload = () => {
    const fileInput = document.getElementById("file_upload");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      const reader = new FileReader();

      reader.onload = () => {
        const data = reader.result;
        setFileContent("");
        setContinue(false);
        if (data) {
          // basic verify
          const isVerified = true;
          if (isVerified) {
            setFileContent(data.toString());
            setDialogTitle("Enter Password");
            setDialogContent("");
          } else {
            setDialogTitle("Invalid File Format");
            setDialogContent(
              "Please make sure that you selected the correct backup file with .bak extension."
            );
          }
          setDialogOpen(true);
        }
      };

      reader.readAsText(event.target.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setFileContent("");
    setContinue(false);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleOk = (passwd: string) => {
    // verify vault
    console.log(passwd);
    const isVerified = false;
    if (isVerified) {
      setContinue(true);
    } else {
      setFileContent("");
      setDialogTitle("Incorrect Password");
      setDialogContent("Failed to decrypt the backup");
      setTimeout(() => {
        setDialogOpen(true);
      }, 0);
    }
  };

  const handleContinue = () => {
    // save vault
  };

  return (
    <>
      <input
        id="file_upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-white pt-[10vh]">
        <div className="text-center px-20">
          <h6 className="text-lg mb-8">
            Enter your previously created vault share
          </h6>
          <div
            className="w-full bg-[#33E6BF]/[.14] h-[250px] border-2 border-dashed border-[#33E6BF] rounded-lg font-bold cursor-pointer"
            onClick={handleUpload}
          >
            <img
              src="/assets/images/file.svg"
              className="mx-auto mb-4 mt-20"
              alt="file"
            />
            Upload backup file
          </div>
          {selectedFile && fileContent && isContinue && (
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
                onClick={handleCancel}
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
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
      <ImportVaultDialog
        title={dialogTitle}
        content={dialogContent}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onOk={handleOk}
      />
    </>
  );
};

export default ImportVaultView;
