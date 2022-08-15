import { bufferCV, bufferCVFromString, ClarityValue, tupleCV } from 'micro-stacks/clarity';
import { useOpenContractCall } from '@micro-stacks/react';
import {
  createAssetInfo,
  FungibleConditionCode,
  makeContractNonFungiblePostCondition,
  makeContractSTXPostCondition,
  makeStandardSTXPostCondition,
  NonFungibleConditionCode,
  PostCondition,
  PostConditionMode,
} from 'micro-stacks/transactions';
import { addSaltAndhash160, fromHexString } from '../lib/strings';
import { communityHandlesContract } from '../lib/constants';

export const PreorderNameButton = ({
  stxAddress,
  contract,
  name,
  namespace,
  salt,
}: {
  stxAddress: string;
  contract: { address: string; name: string };
  name: string;
  namespace: string;
  salt: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const hashedSaltedName = addSaltAndhash160(`${name}.${namespace}`, salt);
  const label = `Preorder name ${name}.${namespace}`;
  const contractAddress = contract.address;
  const contractName = contract.name;
  const functionName = 'name-preorder';
  const functionArgs: ClarityValue[] = [bufferCV(hashedSaltedName)];

  const postConditions: PostCondition[] = [
    makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, 10_000_000),
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
