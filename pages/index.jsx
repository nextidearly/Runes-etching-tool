"use client";

import React, { useState } from "react";
import Head from "next/head";
import Layout from "@/components/sections/Layout";
import openAPI from "../services/openAPI";
import toast from "react-hot-toast";
import bigInt from "big-integer";
import * as bitcoin from "bitcoinjs-lib";
import FeeRecommend from "../components/UI/FeeRecommend";
import AttachFileComponent from "../components/UI/AttachFileComponent";
import { useWalletData } from "../store/hooks";
import { Transaction } from "@unisat/wallet-sdk/es/transaction/transaction"; // Adjust the path as necessary
import { calculateFee, satoshisToBTC } from "@/utils";
import { FaTimes } from "react-icons/fa";
import { Decimal } from "decimal.js";
import { RuneId, Runestone } from "runestone-js";
import { U128, U32, U64 } from "big-varuint-js";

const Inscribe = () => {
  const { address, pubkey, feeOptions, price } = useWalletData();
  const [runeId, setRuneId] = useState("840893:3");
  const [feeOption, setFeeOption] = useState(feeOptions[0].feeRate);

  const [utxosBTC, setUtxosBTC] = useState([]);
  const [utxosRUNE, setUtxosRUNE] = useState([]);

  const [files, setFiles] = useState([]);

  const [error, setError] = useState("");
  const [glError, setGlError] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [loadingAirdrop, setLoadingAirdrop] = useState(false);
  const [fetctcingUTXOs, setFetchingUTXOs] = useState(false);

  function fromDecimalAmount(decimalAmount, divisibility) {
    decimalAmount = decimalAmount.replace(/\.$/, "");
    if (divisibility === 0) {
      return decimalAmount;
    }
    const amount = new Decimal(decimalAmount).times(
      new Decimal(10).pow(divisibility)
    );
    return amount.toString();
  }

  const handleFetchBTCUTXOs = async () => {
    try {
      let utxos = await openAPI.getBTCUtxos(address);
      console.log(utxos.length, "-1");
      utxos = utxos.filter((v) => v.height !== 4194303);

      console.log(utxos.length, "-2");

      const filteredUTXOs = await utxos
        .filter((v) => {
          return v.satoshi > 1000;
        })
        .map((v) => {
          return {
            txid: v.txid,
            vout: v.vout,
            satoshis: v.satoshi,
            scriptPk: v.scriptPk,
            addressType: 2,
            pubkey: pubkey,
            inscriptions: v.inscriptions,
            atomicals: [],
            runes: [],
          };
        })
        .sort((a, b) => b.satoshis - a.satoshis);
      console.log(filteredUTXOs);
      setUtxosBTC(filteredUTXOs);
      return filteredUTXOs;
    } catch (error) {
      console.log(error);
    }
  };

  const handleFetchRunesUTXOs = async () => {
    try {
      const utxos = await openAPI.getRunesUTXOs(address, runeId);
      const assetUtxos = utxos
        .map((v) => {
          return {
            txid: v.txid,
            vout: v.vout,
            satoshis: v.satoshi,
            scriptPk: v.scriptPk,
            addressType: 2,
            pubkey: pubkey,
            inscriptions: [],
            atomicals: [],
            runes: v?.runes,
          };
        })
        .sort((a, b) => b?.runes[0].amount - a?.runes[0].amount);
      setUtxosRUNE(assetUtxos);
      return assetUtxos;
    } catch (error) {
      console.log(error);
    }
  };

  async function sendRunes({
    assetUtxos,
    utxos,
    assetAddress,
    btcAddress,
    recipients,
    networkType,
    runeid,
    outputValue,
    divisibility,
  }) {
    try {
      const tx = new Transaction();
      const toSignInputs = [];
      const edicts = [];
      let startFrom = 1;
      let totalRuneAmount = bigInt(0);
      let fromRuneAmount = bigInt(0);
      let totalOutputValue = 0;
      let totalInputValue = 0;

      tx.setNetworkType(networkType);
      tx.setEnableRBF(true);
      tx.setChangeAddress(btcAddress);

      recipients.forEach((recipient) => {
        totalRuneAmount = totalRuneAmount.plus(bigInt(recipient.runeAmount));
      });

      totalRuneAmount = fromDecimalAmount(
        totalRuneAmount.toString(),
        divisibility
      );

      let shouldStop = false;
      let toSignInputsIndex = 0;

      assetUtxos.forEach(function (v, index) {
        if (shouldStop) return;

        if (v?.runes) {
          tx.addInput(v);
          toSignInputs.push({
            index: index,
            publicKey: v.pubkey,
          });
          totalInputValue += v.satoshis;
          toSignInputsIndex++;

          v?.runes.forEach((w) => {
            if (w.runeid === runeid) {
              divisibility = w.divisibility;
              fromRuneAmount = fromRuneAmount.plus(bigInt(w.amount));
              if (Number(totalRuneAmount) > 100000) {
                if (
                  fromRuneAmount.gt(Number(Number(totalRuneAmount) + 100000))
                ) {
                  shouldStop = true; // Set shouldStop to true to indicate to stop looping
                  return; // Exit the inner loop
                }
              } else {
                if (fromRuneAmount.gt(Number(Number(totalRuneAmount)))) {
                  shouldStop = true; // Set shouldStop to true to indicate to stop looping
                  return; // Exit the inner loop
                }
              }
            }
          });
        }
      });

      let shouldStopBTCUtxoLooping = false; // Flag variable to indicate whether to stop looping

      utxos.forEach(function (v, index) {
        if (shouldStopBTCUtxoLooping) return; // If shouldStop is true, exit the loop

        tx.addInput(v);
        toSignInputs.push({
          index: index + toSignInputsIndex,
          publicKey: v.pubkey,
        });
        totalInputValue += v.satoshis;
        if (totalInputValue > 100000) {
          shouldStopBTCUtxoLooping = true; // Set shouldStop to true to indicate to stop looping
        }
      });

      if (fromRuneAmount.lt(totalRuneAmount)) {
        setError(`Insufficient rune asset UTXOs for the transaction
        You have: ${Number(fromRuneAmount) / 10 ** divisibility}
        Required: ${Number(totalRuneAmount) / 10 ** divisibility}`);
        return;
      }
      console.log("------------");

      const changedRuneAmount = fromRuneAmount.minus(
        bigInt(Number(totalRuneAmount))
      );

      const RUNEID = new RuneId(
        new U64(BigInt(Number(runeId.split(":")[0]))),
        new U32(BigInt(Number(runeId.split(":")[1])))
      );
      console.log("------------");

      if (changedRuneAmount.gt(0)) {
        if (changedRuneAmount.gt(100000)) {
          const edit = {
            id: RUNEID,
            amount: new U128(BigInt(Number(changedRuneAmount) - 100000)),
            output: new U32(BigInt(1)),
          };
          edicts.push(edit);

          const splitEdict = {
            id: RUNEID,
            amount: new U128(BigInt(100000)),
            output: new U32(BigInt(2)),
          };
          edicts.push(splitEdict);
          startFrom = 3;
        } else {
          console.log("------------");

          const edit = {
            id: RUNEID,
            amount: new U128(BigInt(Number(changedRuneAmount))),
            output: new U32(BigInt(1)),
          };
          edicts.push(edit);
          startFrom = 2;
        }
      }
      console.log("------------");

      recipients.forEach(({ _, runeAmount }, index) => {
        edicts.push({
          id: RUNEID,
          amount: new U128(BigInt(runeAmount * 10 ** divisibility)),
          output: new U32(BigInt(index + startFrom)),
        });
      });
      console.log("------------");

      const runestone = new Runestone({
        edicts: edicts,
      });

      const buffer = runestone.enchiper();

      tx.addScriptOutput(
        bitcoin.script.compile([
          bitcoin.opcodes.OP_RETURN,
          bitcoin.opcodes.OP_13,
          buffer,
        ]),
        0
      );
      console.log("------------");

      if (changedRuneAmount.gt(0)) {
        tx.addOutput(assetAddress, outputValue);
        totalOutputValue += outputValue;
        if (changedRuneAmount.gt(100000)) {
          tx.addOutput(address, outputValue);
          totalOutputValue += outputValue;
        }
      }

      recipients.forEach(({ toAddress, _ }) => {
        tx.addOutput(toAddress, outputValue);
        totalOutputValue += outputValue;
      });
      console.log("------------");

      const psbt = new bitcoin.Psbt({
        network: bitcoin.networks.bitcoin,
      });

      tx.inputs.forEach(function (v, index) {
        psbt.data.addInput(v.data);
        psbt.setInputSequence(index, 0xfffffffd);
      });
      console.log("------------");

      tx.outputs.forEach(function (v) {
        if (v.address) {
          psbt.addOutput({
            address: v.address,
            value: v.value,
          });
        } else if (v.script) {
          psbt.addOutput({
            script: v.script,
            value: v.value,
          });
        }
      });

      return { psbt, toSignInputs, totalInputValue, totalOutputValue };
    } catch (error) {
      console.log("error", error);
    }
  }

  const handleAirdrop = async () => {
    setError("");
    setGlError("");
    setTransactionId("");

    try {
      setFetchingUTXOs(true);
      const BTCUTXOS = await handleFetchBTCUTXOs();
      const RUNEUTXOS = await handleFetchRunesUTXOs();
      setFetchingUTXOs(false);
      setLoadingAirdrop(true);

      if (!BTCUTXOS.length) {
        setError("Insufficient BTC UTXOs for the transaction");
        setFetchingUTXOs(false);
        setLoadingAirdrop(false);
        return;
      }

      if (!RUNEUTXOS.length) {
        setError("Insufficient Runes UTXOs for the transaction");
        setFetchingUTXOs(false);
        setLoadingAirdrop(false);
        return;
      }

      const transactionDetails = {
        assetUtxos: RUNEUTXOS, // Populate with actual UTXOs
        utxos: BTCUTXOS, // Populate with actual UTXOs
        assetAddress: address,
        btcAddress: address,
        recipients: files,
        networkType: 0,
        runeid: runeId,
        outputValue: 546, // Example output value in BTC
        feeRate: feeOption, // Satoshis per byte
        divisibility: RUNEUTXOS[0]?.runes[0].divisibility,
      };

      const { psbt, toSignInputs, totalInputValue, totalOutputValue } =
        await sendRunes(transactionDetails);

      // const fee = calculateFee(
      //   psbt.txInputs.length + 30,
      //   psbt.txOutputs.length,
      //   feeOption
      // );

      const fee = calculateFee(
        psbt.txInputs.length,
        psbt.txOutputs.length,
        feeOption
      );

      // const changeValue = totalInputValue - totalOutputValue - fee - 47014 * 15;
      const changeValue = totalInputValue - totalOutputValue - fee;

      if (changeValue < 0) {
        setLoadingAirdrop(false);
        setError(`Your wallet address doesn't have enough funds to buy this insscription.
        Price:     ~$ ${price}
        You have:     ${satoshisToBTC(totalInputValue)}
        Required:     ${satoshisToBTC(totalInputValue - changeValue)}
        Missing:     ${satoshisToBTC(-changeValue)}
        `);
        return;
      }

      // for (let index = 0; index < 15; index++) {
      //   // Change utxo
      //   psbt.addOutput({
      //     address: address,
      //     value: 47014,
      //   });
      // }

      // console.log(changeValue);

      // Change utxo
      psbt.addOutput({
        address: address,
        value: changeValue,
      });

      const psbtHex = psbt.toHex();

      let signedPSBTHex = await window.unisat.signPsbt(psbtHex, {
        autoFinalized: true,
        toSignInputs,
      });
      let tx = await unisat.pushPsbt(signedPSBTHex);
      setTransactionId(tx);
    } catch (error) {
      setFetchingUTXOs(false);
      setLoadingAirdrop(false);
      if (
        error !== null &&
        typeof error === "object" &&
        Object.keys(error).length > 0
      ) {
        setGlError(JSON.stringify(error));
      } else {
        if (!(error.toString().indexOf("intermediate value") > 0))
          setGlError(error.toString());
      }
    }
    setFetchingUTXOs(false);
    setLoadingAirdrop(false);
  };

  return (
    <Layout>
      <Head>
        <title>Airdrop</title>
        <meta
          name="description"
          content="The easiest Bitcoin runes airdrop tool"
        />
      </Head>

      <div className="mx-auto w-full container max-w-[900px] mt-16 px-3 sm:px-0">
        <h1 className="text-center text-4xl font-extrabold mb-6">
          Bitcoin Runes Airdrop
        </h1>

        <div className="bg-white rounded-lg cs-border py-4 w-full px-4 pb-5">
          <div className="flex justify-between mb-2">
            <div>
              <label htmlFor="runeId">Input RuneId: </label>

              <input
                id="runeId"
                type="text"
                onChange={(e) => {
                  setRuneId(e.target.value);
                }}
                placeholder="923223:02"
                className="bg-gray-100 rounded-md px-2 py-1 cs-border"
              />
            </div>
            <div>
              {files.length ? (
                <button
                  className="main_btn px-4 py-1 rounded-md flex gap-2 items-center"
                  onClick={() => {
                    setFiles([]);
                  }}
                >
                  <FaTimes /> Clear
                </button>
              ) : (
                ""
              )}
            </div>
          </div>

          <AttachFileComponent setFiles={setFiles} files={files} />
        </div>
        <div className="bg-white rounded-lg cs-border py-4 w-full px-4 pb-5 mt-6">
          <div className="flex gap-2">
            <div className="w-full max-h-[200px] overflow-y-auto">
              <div className="bg-gray-100 p-2 rounded-md min-h-[50px] mt-2 cs-border">
                {utxosBTC.length ? (
                  <div>
                    {utxosBTC.map((data, index) => {
                      return (
                        <div
                          className="py-1 rounded-md bg-gray-200 flex mb-0.5 justify-between px-2"
                          key={index}
                        >
                          <div>{index + 1}</div>
                          <div>{data?.satoshis}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full w-full">
                    {" "}
                    no Data ;(
                  </div>
                )}
              </div>
            </div>
            <div className="w-full max-h-[200px] overflow-y-auto">
              <div className="bg-gray-100 p-2 rounded-md min-h-[50px] mt-2 cs-border">
                {utxosRUNE.length ? (
                  <div>
                    {utxosRUNE.map((data, index) => {
                      return (
                        <div
                          className="py-1 rounded-md bg-gray-200 mb-0.5 flex justify-between px-2"
                          key={index}
                        >
                          <div>{data?.runes[0]?.symbol}</div>
                          <div>
                            {data?.runes[0]?.amount /
                              10 ** data?.runes[0]?.divisibility}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full w-full">
                    {" "}
                    no Data ;(
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg cs-border py-4 w-full px-4 pb-5 mt-2">
          <div className="flex gap-2">
            <div className="w-full">
              <FeeRecommend setFeeOption={setFeeOption} />

              <button
                disabled={loadingAirdrop}
                className="w-full main_btn rounded-md py-1 flex justify-center items-center mt-4"
                onClick={() => {
                  if (!address) {
                    toast.error("Connect your wallet.");
                    return;
                  }
                  if (!files.length) {
                    toast.error("Please upload file.");
                    return;
                  }
                  if (!runeId) {
                    toast.error("Please input your rune id.");
                    return;
                  }
                  handleAirdrop();
                }}
              >
                {fetctcingUTXOs
                  ? "Fetching UTXOs..."
                  : loadingAirdrop
                  ? "Airdropping..."
                  : "Airdrop"}
              </button>
            </div>
          </div>

          {transactionId && (
            <div className="text-center p-4 bg-green-100 border border-green-300 mt-4 rounded-md">
              <a
                href={`https://mempool.space/tx/${transactionId}`}
                target="_blank"
                className="text-center underline"
              >
                {transactionId}
              </a>
            </div>
          )}

          {error && (
            <div className="text-center p-4 bg-red-100 border border-red-300 mt-4 rounded-md overflow-auto">
              <pre style={{ wordWrap: "break-word" }}>{error}</pre>
            </div>
          )}

          {glError && (
            <div className="text-center p-4 bg-red-100 border border-red-300 mt-4 rounded-md overflow-auto">
              <pre style={{ wordWrap: "break-word" }}>{glError}</pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Inscribe;
