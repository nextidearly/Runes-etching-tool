/* eslint-disable indent */
import React, { useEffect, useRef, useState } from "react";
import openApi from "@/services/openAPI";
import toast from "react-hot-toast";
import { updatePrice, updateAddress, updatePubkey } from "@/store/slices/wallet";
import { currentPrice } from "@/utils";
import { useDispatch } from "react-redux";
import {
  getAddress,
  sendBtcTransaction,
  AddressPurpose,
  BitcoinNetworkType,
} from "sats-connect";
import { useWalletData } from "@/store/hooks";
import { useWallets, useWallet } from "@wallet-standard/react";

const SatsConnectNamespace = "sats-connect:";

function isSatsConnectCompatibleWallet(wallet) {
  return SatsConnectNamespace in wallet.features;
}

export const WalletContext = React.createContext();

const Wallet = (props) => {
  const dispatch = useDispatch();
  const isMounted = useRef(false);
  const { wallets } = useWallets();
  const { setWallet } = useWallet();
  const filteredwallets = wallets.filter(isSatsConnectCompatibleWallet);
  const magicedenWallet = filteredwallets.filter(
    (wallet) => wallet.name == "Magic Eden"
  );
  const { address } = useWalletData();

  const [connected, setConnected] = useState(false);
  const [selectedwallet, setSelectedwallet] = useState("unisat");

  const getFeeSummary = async () => {
    const result = await openApi.getFeeSummary();
    return result;
  };

  const getPrice = async () => {
    const price = await currentPrice();
    dispatch(updatePrice(price));
  };

  const getBasicInfo = async () => {
    const unisat = window.unisat;
    const [address] = await unisat.getAccounts();
    const pubkey = await unisat.getPublicKey();
    dispatch(updateAddress(address));
    dispatch(updatePubkey(pubkey));
  };

  const ConnectWallet = async () => {
    try {
      const result = await unisat.requestAccounts();
      handleAccountsChanged(result);
      setConnected(true);
      setSelectedwallet("unisat");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const XverseWalletConnect = async () => {
    try {
      const getAddressOptions = {
        payload: {
          purposes: ["payment"],
          message: "Address for receiving payments",
          network: {
            type: "Mainnet",
          },
        },
        onFinish: (response) => {
          dispatch(updateAddress(response.addresses[0].address));
          setConnected(true);
          setSelectedwallet("xverse");
        },
        onCancel: () => toast.error("Request canceled"),
      };

      await getAddress(getAddressOptions);
    } catch (error) {
      console.log(error);
    }
  };

  const OkxWalletConnect = async () => {
    try {
      if (typeof window.okxwallet === "undefined") {
        toast.error("OKX is not installed!");
      } else {
        const result = await window.okxwallet.bitcoin.connect();
        dispatch(updateAddress(result.address));
        setConnected(true);
        setSelectedwallet("okx");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const LeatherWalletConnect = async () => {
    try {
      if (typeof window.LeatherProvider === "undefined") {
        toast.error("Leather is not installed!");
      } else {
        const userAddresses = await window.LeatherProvider?.request(
          "getAddresses"
        );
        const usersNativeSegwitAddress = userAddresses.result.addresses.find(
          (address) => address.type === "p2wpkh"
        );
        dispatch(updateAddress(usersNativeSegwitAddress.address));
        setConnected(true);
        setSelectedwallet("leather");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const MagicedenWalletConnect = async () => {
    if (magicedenWallet[0]) {
      try {
        await getAddress({
          getProvider: async () =>
            magicedenWallet[0].features[SatsConnectNamespace]?.provider,
          payload: {
            purposes: [AddressPurpose.Payment],
            message: "Address for receiving Ordinals and payments",
            network: {
              type: BitcoinNetworkType.Mainnet,
            },
          },
          onFinish: (response) => {
            setWallet(magicedenWallet[0]);
            setConnected(true);
            dispatch(updateAddress(response.addresses[0].address));
            setSelectedwallet("magiceden");
          },
          onCancel: () => {
            toast.error("Request canceled");
          },
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      toast.error("Please install wallet");
    }
  };

  const handleAccountsChanged = (_accounts) => {
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setConnected(true);
      // setAddress(_accounts[0]);
      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const DisconnectWallet = () => {
    setConnected(false);
    dispatch(updateAddress(""));
    setWallet(null);
  };

  // send BTC
  const depositCoin = async (payAddress, amount, feeRate) => {
    let res;

    try {
      if (selectedwallet === "unisat") {
        res = await depositCoinonUnisat(payAddress, amount, feeRate);
      } else if (selectedwallet === "xverse") {
        res = await depositCoinonXverse(payAddress, amount, feeRate);
      } else if (selectedwallet === "okx") {
        res = await depositCoinonOkx(payAddress, amount, feeRate);
      } else if (selectedwallet === "leather") {
        res = await depositCoinonLeather(payAddress, amount, feeRate);
      } else if (selectedwallet === "magiceden") {
        res = await depositCoinonMagicEden(payAddress, amount, feeRate);
      }
      return res;
    } catch (error) {
      console.log(error);
      toast.error(error.toString());
    }
  };

  const depositCoinonUnisat = async (payAddress, amount, feeRate) => {
    if (address) {
      try {
        const { txid } = await window.unisat.sendBitcoin(
          payAddress,
          amount,
          feeRate
        );
        return "txid";
      } catch (e) {
        toast.error(e.message);
      }
    } else {
      toast.error("Please connect wallet");
    }
  };

  const depositCoinonXverse = async (payAddress, amount, feeRate) => {
    if (address) {
      try {
        let res;
        await sendBtcTransaction({
          payload: {
            network: {
              type: "Mainnet",
            },
            recipients: [
              {
                address: payAddress,
                amountSats: BigInt(amount),
              },
              // you can add more recipients here
            ],
            senderAddress: address,
          },
          onFinish: (response) => {
            res = "success";
          },
          onCancel: () => {
            toast.error("Canceled");
            res = "Canceled";
          },
        });
        if (res == "success") {
          return "txid";
        }
      } catch (e) {
        console.log(e);
        toast.error(e.message);
      }
    } else {
      toast.error("Please connect wallet");
    }
  };

  const depositCoinonOkx = async (payAddress, amount, feeRate) => {
    try {
      if (address) {
        const tx = await window.okxwallet.bitcoin.send({
          from: address,
          to: payAddress,
          value: amount / 10 ** 8,
        });
        // return tx.txhash;
        return "txid";
      } else {
        toast.error("Please connect wallet");
      }
    } catch (error) {
      console.log("depositCoinonOkx", error);
    }
  };

  const depositCoinonLeather = async (payAddress, amount, feeRate) => {
    if (address) {
      try {
        const resp = await window.LeatherProvider?.request("sendTransfer", {
          address: payAddress,
          amount: amount,
        });
        // return resp.result.txid;
        return "txid";
      } catch (e) {
        toast.error(e.error.message);
      }
    } else {
      toast.error("Please connect wallet");
    }
  };

  const depositCoinonMagicEden = async (payAddress, amount, feeRate) => {
    if (!magicedenWallet[0]) {
      toast.error("Please connect wallet");
      return;
    }

    try {
      let res;
      await sendBtcTransaction({
        getProvider: async () =>
          magicedenWallet[0].features[SatsConnectNamespace]?.provider,
        payload: {
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
          recipients: [
            {
              address: payAddress,
              amountSats: BigInt(amount),
            },
          ],
          senderAddress: address,
        },
        onFinish: (response) => {
          res = "success";
        },
        onCancel: () => {
          toast.error("Canceled");
          res = "Canceled";
        },
      });

      if (res == "success") {
        return "txid";
      }
    } catch (error) {
      toast.error("Please connect wallet");
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      getPrice();
      DisconnectWallet();
      isMounted.current = true;
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ConnectWallet,
        getFeeSummary,
        getBasicInfo,
        XverseWalletConnect,
        OkxWalletConnect,
        LeatherWalletConnect,
        handleAccountsChanged,
        DisconnectWallet,
        depositCoinonUnisat,
        depositCoinonXverse,
        depositCoinonOkx,
        depositCoinonLeather,
        depositCoin,
        depositCoinonMagicEden,
        MagicedenWalletConnect,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
};

export default Wallet;
