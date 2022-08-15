import {
  BufferCV,
  bufferCVFromString,
  ClarityValue,
  noneCV,
  uintCV,
  UIntCV,
} from 'micro-stacks/clarity';
import { useAuth, useOpenContractCall } from '@micro-stacks/react';
import {
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  PostCondition,
} from 'micro-stacks/transactions';
import { namesApi, network } from '../lib/stacksApi';
import { lifetime } from '../lib/constants';

export const NamespaceRevealButton = ({
  stxAddress,
  communityHandlesContract,
  namespace,
  salt,
}: {
  stxAddress: string;
  communityHandlesContract: { address: string; name: string };
  namespace: string;
  salt: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Reveal namespace .${namespace}`;
  const contractAddress = communityHandlesContract.address;
  const contractName = communityHandlesContract.name;
  const functionName = 'namespace-reveal';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(namespace),
    bufferCVFromString(salt),
    uintCV(lifetime),
    noneCV(),
  ];

  const postConditions: (string | PostCondition)[] = [];

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
