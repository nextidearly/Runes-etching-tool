import { useSelector } from "react-redux";

export const useBlocks = () => {
  return useSelector((state) => state?.persistedReducer?.blocksReducer?.value);
};

export const useInscribe = () => {
  return useSelector(
    (state) => state?.persistedReducer?.inscribeReducer?.value
  );
};

export const useOpenApi = () => {
  return useSelector((state) => state?.persistedReducer?.openAPIReducer?.value);
};

export const useWalletData = () => {
  return useSelector((state) => state?.persistedReducer?.walletReducer?.value);
};

export const useAddress = () => {
  const wallet = useSelector(
    (state) => state?.persistedReducer?.walletReducer?.value
  );
  try {
    return { address: wallet?.account?.accounts[0]?.address };
  } catch (error) {
    return { address: "" };
  }
};
