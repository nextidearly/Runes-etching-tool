import React, { Fragment, useRef } from "react";
import { useEffect, useState, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import { FaGasPump } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdBicycle } from "react-icons/io";
import { MdLocalAirport } from "react-icons/md";
import { MdElectricBolt } from "react-icons/md";
import { WalletContext } from "@/context/wallet";
import { updateFeeRate } from "@/store/slices/wallet";
import { useDispatch } from "react-redux";

export default function GasBar() {
  const wallet = useContext(WalletContext);
  const dispatch = useDispatch();
  const isMounted = useRef(false);
  const [feeOptions, setFeeOptions] = useState([
    {
      title: "Slow",
      desc: "About 1 hours",
      feeRate: 12,
    },
    {
      title: "Avg",
      desc: "About 30 minutes",
      feeRate: 12,
    },
    {
      title: "Fast",
      desc: "About 10 minutes",
      feeRate: 13,
    },
  ]);

  useEffect(() => {
    if (!isMounted.current) {
      wallet.getFeeSummary().then((v) => {
        setFeeOptions(v?.list);
        dispatch(updateFeeRate({ feeRate: v?.list }));
      });

      isMounted.current = true;
    }
  }, []);

  return (
    <Menu as="div" className="relative inline-block text-left text-white">
      <div className="flex justify-center items-center gap-2">
        {/* <Menu.Button className="focus:outline-none">
          <div className="flex gap-2 items-center text-white">
            <FaGasPump />{" "}
            <span className="text-sm font-thin">
              {feeOptions[0]?.feeRate} sats/vB
            </span>
            <IoIosArrowDown />
          </div>
        </Menu.Button> */}
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-20 mt-[29px] w-[210px] origin-top-right rounded-md text-black text-sm font-semibold translate-x-1/3">
          <div className="p-3 rounded-lg wallet-bg">
            <div className="flex gap-2 mt-2 items-center">
              <IoMdBicycle className="text-xl" /> Low: {feeOptions[0]?.feeRate}{" "}
              sats/vB
            </div>
            <div className="flex gap-2 mt-3 items-center">
              <MdLocalAirport className="text-xl" /> Medium:{" "}
              {feeOptions[1]?.feeRate} sats/vB
            </div>
            <div className="flex gap-2 mt-3 mb-2 items-center">
              <MdElectricBolt className="text-xl" /> High:{" "}
              {feeOptions[2]?.feeRate} sats/vB
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
