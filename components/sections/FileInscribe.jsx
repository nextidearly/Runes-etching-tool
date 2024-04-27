import toast from "react-hot-toast";
import Brc20InscribeCheck from "./Brc20InscribeCheck";
import { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useWalletData } from "@/store/hooks";
import { LiaTimesCircle } from "react-icons/lia";
import InscribeOrder from "./InscribeOrder";
import AttachFileComponent from "../UI/AttachFileComponent";

function fileToDataURL(file, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    callback(event.target.result);
  };
  reader.onerror = function (error) {
    console.error("Error occurred while reading the file:", error);
  };
  reader.readAsDataURL(file);
}

function File({ setStep, step, op }) {
  const { address } = useWalletData();

  const [files, setFiles] = useState("");
  const [filesErr, setFilesErr] = useState("");

  const [inscriptionData, setInscriptionData] = useState();

  const [loading, setLoading] = useState(false);

  const handleCreateInscriptionData = async () => {
    setFilesErr("");
    try {
      if (!files || files.length === 0) {
        setFilesErr("Files cannot be empty.");
        return;
      }
  
      setLoading(true);
  
      const dataPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          fileToDataURL(file, (dataURL) => {
            resolve({
              dataURL: dataURL,
              filename: file.name,
            });
          });
        });
      });
  
      const data = await Promise.all(dataPromises);
      setInscriptionData(data);
      setStep(1);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.toString());
    }
  };

  const renderContent = (step) => {
    if (step === 0) {
      return (
        <>
          {filesErr && <p className="text-red-600">{filesErr}</p>}
          <AttachFileComponent setFiles={setFiles} />

          <div className="w-full bg-gray-100 rounded-md p-2 max-h-[200px] overflow-y-auto mb-2">
            {files &&
              files.map((data, index) => {
                return (
                  <div
                    className="flex gap-2 cs-border p-1.5 rounded-md items-center bg-gray-200 mb-1 justify-between text-sm"
                    key={index}
                  >
                    <div className="px-1">{index + 1}</div>
                    <div className="break-words">{data.name}</div>
                    <div className="flex gap-2 items-center">
                      <div>
                        {data.size / 1000}{" "}
                        <span className="text-gray-800 text-sm">KB</span>
                      </div>
                      <button
                        onClick={() => {
                          const newArray = [...files];
                          newArray.splice(index, 1);
                          setFiles(newArray);
                        }}
                      >
                        <LiaTimesCircle className="text-xl" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {loading ? (
            <button className="w-full main_btn py-2 px-3 mt-4 rounded-lg flex justify-center items-center">
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (address) {
                  handleCreateInscriptionData();
                } else {
                  toast.error("Please connect your wallet.");
                }
              }}
              className="w-full main_btn py-2 px-3 mt-4 rounded-lg"
            >
              Next
            </button>
          )}
        </>
      );
    } else if (step == 1) {
      return (
        <>
          <InscribeOrder
            setInscriptionData={setInscriptionData}
            inscriptionData={inscriptionData}
            setStep={setStep}
            isbrc20={false}
            op={op}
          />
        </>
      );
    }
  };

  return <div className="w-full">{renderContent(step)}</div>;
}

export default function FileInscribe() {
  const [step, setStep] = useState(0);

  return (
    <div className="bg-white rounded-lg cs-border py-4 w-full px-4 pb-5">
      {step === 0 && (
        <>
          <p className="my-3 text-lg text-center">
            Upload your{" "}
            <span className="text-orange-500 font-semibold"> files</span> to
            begin
          </p>
        </>
      )}

      <File setStep={setStep} step={step} op={"file"} />
    </div>
  );
}
