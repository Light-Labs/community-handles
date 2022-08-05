import {
  BufferCV,
  bufferCVFromString,
  ClarityValue,
  contractPrincipalCV,
  uintCV,
  UIntCV,
} from 'micro-stacks/clarity';
import { useAuth, useOpenContractCall } from '@micro-stacks/react';
import {
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  PostCondition,
} from 'micro-stacks/transactions';

export const NamespaceSetOwnerButton = ({
  stxAddress,
  namespaceContract,
  namespace,
  newOwner,
}: {
  stxAddress: string;
  namespaceContract: { address: string; name: string };
  namespace: string;
  newOwner: { address: string; name: string };
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Set new owner for .${namespace}`;
  const contractAddress = namespaceContract.address;
  const contractName = namespaceContract.name;
  const functionName = 'set-namespace-owner';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(namespace),
    contractPrincipalCV(newOwner.address, newOwner.name),
  ];

  const postConditions: PostCondition[] = [];

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
