// @flow
import React, { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { LuUploadCloud } from "react-icons/lu";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { shortAddress } from "@/utils";

const AttachFileComponent = ({ setFiles, files }) => {
  const [loading, setLoading] = useState(false);
  const [sum, setSum] = useState(0);
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setLoading(true);
      try {
        const file = acceptedFiles[0]; // Assuming only one file is uploaded
        const fileName = file.name;
        setFileName(fileName);
        const reader = new FileReader();

        reader.onload = () => {
          try {
            const jsonArray = JSON.parse(reader.result);
            const list = jsonArray.airdropList;

            if (list.length > 0) {
              if (list.length > 9) {
                toast.error(
                  "Our service only support 9 addresses per transaction right now."
                );
                return;
              }

              setFiles(list);
              // Use reduce to sum up the runeAmount values
              const sum = list.reduce((total, transaction) => {
                // Add the current transaction's runeAmount to the total
                return total + transaction.runeAmount;
              }, 0); // Start with total of 0
              setSum(sum);
            }
          } catch (parseError) {
            toast.error("Invalid file format");
          }
        };

        reader.readAsText(file);
      } catch (error) {
        toast.error("Error processing file:", error);
      }
      setTimeout(() => {
        setLoading(false);
      }, 500);
    },
    [setLoading, setFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ["application/json, .json"],
    maxFiles: 1000,
  });

  return (
    <>
      {files.length ? (
        <div className="flex gap-2 my-3 justify-end">
          <div>
            File Name: <span className="font-bold">{fileName}</span>
          </div>
          <div>
            Total Users: <span className="font-bold">{files.length}</span>
          </div>
          <div>
            Total Amount: <span className="font-bold">{sum}</span>
          </div>
        </div>
      ) : (
        ""
      )}

      <div
        {...getRootProps()}
        className="w-full min-h-[280px] cs-border rounded-md mb-2 dark:text-gray-300 text-gray-800 cursor-pointer p-4 h-[280px] overflow-y-auto"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <AiOutlineLoading3Quarters className="animate-spin text-4xl" />
          </div>
        ) : (
          <>
            {files.length ? (
              <div className="w-full">
                {files.map((data, key) => {
                  return (
                    <div
                      key={key}
                      className="w-full mb-1 rounded-md bg-gray-200/80 hover:bg-gray-200 delay-200 flex justify-between py-0.5 px-2 text-sm"
                    >
                      <div className="">{shortAddress(data.toAddress, 10)}</div>
                      <div className="">{data.runeAmount}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center flex-col">
                <LuUploadCloud className="text-center text-[40px] mx-auto" />

                <p className="text-center font-semibold pb-0 mb-0">
                  Drag and drop your Airdrop List .json file. MAX 10 outputs
                </p>

                <p className="text-[12px] text-center">
                  Supported file formats:
                </p>
                <pre className="text-[10px] mb-2">
                  {`
  {
    "airdropList": [
      {
        "toAddress": "bc1pfmk...jsusdche8u",
        "runeAmount": 18543
      },
      ...
    ]
  }`}
                </pre>
              </div>
            )}
          </>
        )}
        <input {...getInputProps()} />
      </div>
    </>
  );
};
export default AttachFileComponent;
