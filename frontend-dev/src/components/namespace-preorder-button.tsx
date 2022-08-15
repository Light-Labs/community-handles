import {
  bufferCV,
  BufferCV,
  bufferCVFromString,
  ClarityValue,
  uintCV,
  UIntCV,
} from 'micro-stacks/clarity';
import { useAuth, useOpenContractCall } from '@micro-stacks/react';
import { FungibleConditionCode, makeStandardSTXPostCondition } from 'micro-stacks/transactions';
import { namesApi, network } from '../lib/stacksApi';
import { addSaltAndhash160 } from '../lib/strings';

export const NamespacePreorderButton = ({
  stxAddress,
  communityHandlesContract,
  namespace,
  salt,
  stxToBurn,
}: {
  stxAddress: string;
  communityHandlesContract: { address: string; name: string };
  namespace: string;
  salt: string;
  stxToBurn: number;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Preorder namespace .${namespace}`;
  const hashedSaltedNamespace = addSaltAndhash160(namespace, salt);
  const contractAddress = communityHandlesContract.address;
  const contractName = communityHandlesContract.name;
  const functionName = 'namespace-preorder';
  const functionArgs: ClarityValue[] = [bufferCV(hashedSaltedNamespace), uintCV(stxToBurn)];

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
