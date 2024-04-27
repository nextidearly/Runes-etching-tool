import React, { useEffect, useState } from "react";
import { useWalletData } from "@/store/hooks";

const FeeRateType = {
  SLOW: 0,
  AVG: 1,
  FAST: 2,
  CUSTOM: 3,
};

export default function FeeRecommend({ setFeeOption }) {
  const { feeOptions } = useWalletData();

  const [feeOptionIndex, setFeeOptionIndex] = useState(FeeRateType.FAST);
  const [feeRateInputVal, setFeeRateInputVal] = useState("");

  useEffect(() => {
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feeRate : 1;

    let val = defaultVal;
    if (feeOptionIndex === FeeRateType.CUSTOM) {
      val = parseInt(feeRateInputVal) || 0;
    } else if (feeOptions.length > 0) {
      val = feeOptions[feeOptionIndex].feeRate;
    }
    setFeeOption(val);
  }, [feeOptions, feeOptionIndex, feeRateInputVal]);

  const adjustFeeRateInput = (inputVal) => {
    let val = parseInt(inputVal);
    if (!val) {
      setFeeRateInputVal("");
      return;
    }
    const defaultOption = feeOptions[1];
    const defaultVal = defaultOption ? defaultOption.feeRate : 1;
    if (val <= 0) {
      val = defaultVal;
    }
    setFeeRateInputVal(val.toString());
  };

  return (
    <div>
      <div className="flex justify-between mt-3 gap-2">
        <>
          {feeOptions.length > 0 ? (
            <>
              {feeOptions.map((v, index) => {
                const selected = index === feeOptionIndex;
                return (
                  <div
                    key={v.title}
                    onClick={() => {
                      setFeeOptionIndex(index);
                    }}
                    className={`cursor-pointer flex justify-center flex-col rounded-md cs-border px-2 w-full py-3 bg-gray-100 text-black ${
                      selected && "bg-[#e75648!important] text-white"
                    }`}
                  >
                    <p className="text-center text-sm font-semibold">
                      {v.title}
                    </p>
                    {v.title !== "Custom" && (
                      <p className="text-[9px] text-center">{`${v.feeRate} sats/vB`}</p>
                    )}
                    {v.title !== "Custom" && (
                      <p className="text-center text-[9px]">{`${v.desc}`}</p>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <div className="cursor-pointer flex justify-center flex-col rounded-md cs-border px-2 w-full py-3 h-[81px] bg-gray-200 animate-pulse"></div>
              <div className="cursor-pointer flex justify-center flex-col rounded-md cs-border px-2 w-full py-3 h-[81px] bg-gray-200 animate-pulse"></div>
              <div className="cursor-pointer flex justify-center flex-col rounded-md cs-border px-2 w-full py-3 h-[81px] bg-gray-200 animate-pulse"></div>
              <div className="cursor-pointer flex justify-center flex-col rounded-md cs-border px-2 w-full py-3 h-[81px] bg-gray-200 animate-pulse"></div>
            </>
          )}
        </>
      </div>
      {feeOptionIndex === FeeRateType.CUSTOM && (
        <input
          className="w-full mt-3 bg-transparent py-2 px-2 rounded-md cs-border focus:outline-none"
          preset="amount"
          placeholder={"sats/vB"}
          value={feeRateInputVal}
          onChange={async (e) => {
            adjustFeeRateInput(e.target.value);
          }}
          autoFocus={true}
        />
      )}
    </div>
  );
}
