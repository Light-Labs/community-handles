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
import { fromHexString } from '../lib/strings';
import { communityHandlesContract } from '../lib/constants';

export const RevealNameButton = ({
  stxAddress,
  contract,
  name,
  namespace,
  salt,
  signature,
  zoneFileHash,
}: {
  stxAddress: string;
  contract: { address: string; name: string };
  name: string;
  namespace: string;
  salt: string;
  signature: string;
  zoneFileHash: string;
}) => {
  const { openContractCall } = useOpenContractCall();
  const label = `Reveal name ${name}.${namespace}`;
  const contractAddress = contract.address;
  const contractName = contract.name;
  const functionName = 'name-reveal';
  const functionArgs: ClarityValue[] = [
    bufferCVFromString(name),
    bufferCVFromString(salt),
    bufferCV(fromHexString(signature)),
    bufferCV(fromHexString(zoneFileHash)),
  ];

  const postConditions: PostCondition[] = [
    makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, 1),
    makeContractSTXPostCondition(contractAddress, contractName, FungibleConditionCode.LessEqual, 1),
    makeContractNonFungiblePostCondition(
      contractAddress,
      contractName,
      NonFungibleConditionCode.Owns,
      createAssetInfo('SP000000000000000000002Q6VF78', 'bns', 'names'),
      tupleCV({ namespace: bufferCVFromString(namespace), name: bufferCVFromString(name) })
    ),
    makeContractNonFungiblePostCondition(
      contractAddress,
      contractName,
      NonFungibleConditionCode.DoesNotOwn,
      createAssetInfo('SP000000000000000000002Q6VF78', 'bns', 'names'),
      tupleCV({ namespace: bufferCVFromString(namespace), name: bufferCVFromString(name) })
    ),
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
