import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { useInscribe, useWalletData } from "@/store/hooks";

export default function Bills() {
  const { selectedBlock } = useInscribe();
  const { price } = useWalletData();

  const length = selectedBlock.length;
  const inscribeFee = length * 10000;
  const serviceFee = Number((length * (510000 + 10 ** 8 / price)).toFixed(0));
  const sizeFee = length * 19;
  const totalFee = Number((inscribeFee + serviceFee + sizeFee).toFixed(0));

  return (
    <>
      <hr className="w-[80%] mt-3 mx-auto" />
      <div className="pt-2">
        <div className="grid grid-cols-2 font-light py-1 text-sm">
          <p className="text-right pr-2 ">Sats In Inscription:</p>
          <p className="text-left pl-2 ">
            1 * 546 sats
            <span className="text-[11px] text-gray-500 ">
              &nbsp; ~$&nbsp;
              {(546 * price).toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 font-light py-1  text-sm">
          <p className="text-right pr-2">Network Fee:</p>
          <p className="text-left pl-2">
            5295 sats
            <span className=" text-[11px] text-gray-500 ">
              &nbsp;~$ {(5295 * price).toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 font-light py-1  text-sm">
          <p className="text-right pr-2">Service Fee:</p>
          <p className="text-left pl-2">
            1200 sats
            <span className=" text-[11px] text-gray-500 ">
              &nbsp;~$ {(1200 * price).toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 font-light py-1  text-sm">
          <p className="text-right pr-2">Size Fee:</p>
          <p className="text-left pl-2">
            256 sats
            <span className=" text-[11px] text-gray-500 ">
              &nbsp;~$ {(256 * price).toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 font-light py-1  text-sm">
          <p className="text-right pr-2">=</p>
          <p className="text-left pl-2">
            <span className="line-through"> {7415}</span> sats
            <span className=" text-[11px] text-gray-500 ">
              &nbsp;~$ {((7415 / 10 ** 8) * price).toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 font-light py-1 mt-3  text-sm">
          <p className="text-right pr-2">Total Fee:</p>
          <p className="text-left pl-2">
            {7400} sats
            <span className=" text-[11px] text-gray-500 ">
              &nbsp;~$
              {((7400 / 10 ** 8) * price).toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      <div className="text-sm font-extralight flex justify-center w-full mt-3 text-orange-600">
        <p className="flex gap-1 text-center">
          <AiFillWarning className="text-lg ml-auto" />
          Please note the inscribing transaction delivers the inscription to the
          receiving address directly.
        </p>
      </div>
    </>
  );
}
