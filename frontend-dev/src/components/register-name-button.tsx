import { bufferCV, bufferCVFromString, ClarityValue } from 'micro-stacks/clarity';
import { useOpenContractCall } from '@micro-stacks/react';
import { PostCondition } from 'micro-stacks/transactions';
import { fromHexString } from '../lib/strings';

export const RegisterNameButton = ({
  stxAddress,
  contract,
  name,
  namespace,
  signature,
  zoneFileHash,
}: {
  stxAddress: string;
  contract: { address: string; name: string };
  name: string;
  namespace: string;
  signature: string;
  zoneFileHash: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Register name ${name}.${namespace}`;
  const contractAddress = contract.address;
  const contractName = contract.name;
  const functionName = 'name-register';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(name),
    bufferCV(fromHexString(signature)),
    bufferCV(fromHexString(zoneFileHash)),
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
