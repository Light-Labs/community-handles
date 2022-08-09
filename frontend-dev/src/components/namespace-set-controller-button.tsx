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

export const NamespaceSetControllerButton = ({
  stxAddress,
  namespaceContract,
  namespace,
  newController,
}: {
  stxAddress: string;
  namespaceContract: { address: string; name: string };
  namespace: string;
  newController: { address: string; name: string };
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Set new controller for .${namespace}`;
  const contractAddress = namespaceContract.address;
  const contractName = namespaceContract.name;
  const functionName = 'set-namespace-controller';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(namespace),
    contractPrincipalCV(newController.address, newController.name),
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
