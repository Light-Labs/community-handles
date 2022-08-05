import { bufferCV, bufferCVFromString, ClarityValue } from 'micro-stacks/clarity';
import { useOpenContractCall } from '@micro-stacks/react';
import { PostCondition } from 'micro-stacks/transactions';
import { fromHexString } from '../lib/strings';

export const OwnerPubkeyButton = ({
  stxAddress,
  contract,
  namespace,
  pubkey,
}: {
  stxAddress: string;
  contract: { address: string; name: string };
  namespace: string;
  pubkey: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Set pubkey namespace .${namespace}`;
  const contractAddress = contract.address;
  const contractName = contract.name;
  const functionName = 'set-approval-pubkey';
  const functionArgs: ClarityValue[] = [bufferCV(fromHexString(pubkey))];

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
