/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useContext, useState } from "react";
import Link from "next/link";
import GasBar from "../UI/GasBar";
import toast from "react-hot-toast";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { WalletContext } from "@/context/wallet";
import { useWalletData } from "@/store/hooks";
import { addressFormat, copyToClipboard } from "@/utils";

export default function MenuBar() {
  const { address } = useWalletData();
  const wallet = useContext(WalletContext);
  
  const [modalIsOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex justify-center px-2">
      <div
        className={`flex justify-between items-center fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-[#e75648] px-3 rounded-none w-full`}
      >
        <Link href="/">
          <img
            src="/logo.webp"
            alt=""
            className="sm:w-[45px] w-[35px] rounded-md my-2 ml-1"
          />
        </Link>

        <div className="flex gap-3 items-center">
          <div className="flex justify-center items-center gap-2">
            <Menu
              as="div"
              className="relative inline-block text-left text-black"
            >
              <div className="flex justify-center items-center gap-2">
                <GasBar />

                {address ? (
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="py-1.5 px-6 my-.5 flex items-center gap-3 sm:text-xl text-sm bg-white text-black hover:bg-black hover:text-white rounded-full font-extrabold duration-150">
                      {addressFormat(address, 7)}
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-20 origin-top-right rounded-md text-black text-sm font-semibold block bg-gray-100 p-2 flex-col shadow-md mt-3.5">
                        <div className="w-full inline-block">
                          <Menu.Item>
                            <button
                              onClick={() => {
                                copyToClipboard(address);
                                toast.success("copied");
                              }}
                              className="w-full p-2 hover:bg-gray-200 rounded-md mb-1"
                            >
                              {addressFormat(address, 8)}
                            </button>
                          </Menu.Item>
                          <Menu.Item>
                            <button
                              onClick={() => wallet.DisconnectWallet()}
                              className="w-full p-2 hover:bg-gray-200 rounded-md"
                            >
                              Disconnect
                            </button>
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    className="py-1.5 px-6 my-.5 flex items-center gap-3 sm:text-xl text-sm bg-white text-black hover:bg-black hover:text-white rounded-full font-extrabold duration-150"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </Menu>
          </div>
        </div>

        <Transition appear show={modalIsOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <div className="fixed inset-0 overflow-y-auto z-60">
              <div className="flex min-h-full items-center justify-center p-4 text-center bg-gray-800/50 duration-200">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-slate-200 p-6 text-left align-middle shadow-xl transition-all cs-shadow">
                    <p className="text-xl text-center mb-2 font-bold">
                      Connect a Wallet
                    </p>
                    <div className="py-4">
                      <button
                        className="w-full flex gap-2 mb-2 text-lg items-center hover:bg-gray-300 duration-100 cursor-pointers p-2 rounded-md"
                        onClick={async () => {
                          wallet.ConnectWallet();
                          await closeModal();
                        }}
                      >
                        <img
                          src={"/assets/wallet/unisat.jpg"}
                          alt=""
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "5px",
                          }}
                        />{" "}
                        Unisat Wallet
                      </button>
                      {/* <button
                      className="w-full flex gap-2 mb-2 text-lg items-center hover:bg-gray-300 duration-100 cursor-pointers p-2 rounded-md"
                      onClick={async () => {
                        wallet.XverseWalletConnect();
                        await closeModal();
                      }}
                    >
                      <img
                        alt=""
                        src={"/assets/wallet/xverse.jpg"}
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "5px",
                        }}
                      />{" "}
                      Xverse Wallet
                    </button>
                    <button
                      className="w-full flex gap-2 mb-2 text-lg items-center hover:bg-gray-300 duration-100 cursor-pointers p-2 rounded-md"
                      onClick={async () => {
                        wallet.OkxWalletConnect();
                        await closeModal();
                      }}
                    >
                      <img
                        alt=""
                        src={"/assets/wallet/okx.png"}
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "5px",
                        }}
                      />{" "}
                      Okx Wallet
                    </button>
                    <button
                      className="w-full flex gap-2 text-lg items-center hover:bg-gray-300 duration-100 cursor-pointers p-2 rounded-md mb-2"
                      onClick={async () => {
                        wallet.LeatherWalletConnect();
                        await closeModal();
                      }}
                    >
                      <img
                        src={"/assets/wallet/leather.jpg"}
                        alt=""
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "5px",
                        }}
                      />{" "}
                      Leather Wallet
                    </button>
                    <button
                      className="w-full flex gap-2 text-lg items-center hover:bg-gray-300 duration-100 cursor-pointers p-2 rounded-md"
                      onClick={() => {
                        setLoading(true);
                        wallet.MagicedenWalletConnect();
                        setTimeout(() => {
                          closeModal();
                          setLoading(false);
                        }, 1500);
                      }}
                    >
                      <img
                        src={"/assets/wallet/magiceden.png"}
                        alt=""
                        style={{
                          width: "35px",
                          height: "35px",
                          borderRadius: "5px",
                        }}
                      />{" "}
                      Magic Eden Wallet
                      {loading && (
                        <AiOutlineLoading3Quarters className="animate-spin text-sm" />
                      )}
                    </button> */}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}
