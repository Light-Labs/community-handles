import {
  BufferCV,
  bufferCVFromString,
  ClarityValue,
  noneCV,
  uintCV,
  UIntCV,
} from 'micro-stacks/clarity';
import { useAuth, useOpenContractCall } from '@micro-stacks/react';
import { FungibleConditionCode, makeStandardSTXPostCondition } from 'micro-stacks/transactions';
import { namesApi, network } from '../lib/stacksApi';

export const NamespaceRevealButton = ({
  stxAddress,
  namespaceContract,
  namespace,
  salt,
}: {
  stxAddress: string;
  namespaceContract: { address: string; name: string };
  namespace: string;
  salt: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Reveal namespace .${namespace}`;
  const contractAddress = namespaceContract.address;
  const contractName = namespaceContract.name;
  const functionName = 'namespace-reveal';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(namespace),
    bufferCVFromString(salt),
    uintCV(100),
    noneCV(),
  ];

  const postConditions = [
    makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, stxToBurn),
  ];

  return (
    <button
      onClick={() => {
        void openContractCall({
          contractAddress,
          contractName,
          functionName,
          functionArgs,
          postConditions,
        });
      }}
    >
      {label}
    </button>
  );
};
