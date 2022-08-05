import { BufferCV, bufferCVFromString, ClarityValue, uintCV, UIntCV } from 'micro-stacks/clarity';
import { useAuth, useOpenContractCall } from '@micro-stacks/react';
import { FungibleConditionCode, makeStandardSTXPostCondition } from 'micro-stacks/transactions';
import { namesApi, network } from '../lib/stacksApi';
import { hashString } from '../lib/strings';

export const NamespaceBuyButton = ({
  stxAddress,
  namespaceContract,
  namespace,
  stxToBurn,
}: {
  stxAddress: string;
  namespaceContract: { address: string; name: string };
  namespace: string;
  stxToBurn: number;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Setup namespace .${namespace}`;
  const hashedSaltedNamespace = hashString(namespace);
  const contractAddress = namespaceContract.address;
  const contractName = namespaceContract.name;
  const functionName = 'namespace-setup';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(namespace),
    uintCV(stxToBurn),
    uintCV(100),
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
