import {
  bufferCV,
  bufferCVFromString,
  ClarityValue,
  standardPrincipalCV,
} from 'micro-stacks/clarity';
import { useOpenContractCall } from '@micro-stacks/react';
import { PostCondition } from 'micro-stacks/transactions';
import { fromHexString } from '../lib/strings';

export const TreasuryButton = ({
  contract,
  namespace,
  treasury,
}: {
  contract: { address: string; name: string };
  namespace: string;
  treasury: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Set treasury for namespace .${namespace}`;
  const contractAddress = contract.address;
  const contractName = contract.name;
  const functionName = 'set-community-treasury';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(namespace),
    standardPrincipalCV(treasury),
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
