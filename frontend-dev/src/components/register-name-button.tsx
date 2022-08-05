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
import { daoNamesContract } from '../lib/constants';

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

  const postConditions: PostCondition[] = [
    makeStandardSTXPostCondition(stxAddress, FungibleConditionCode.LessEqual, 5_000_000),
    makeContractSTXPostCondition(
      daoNamesContract.address,
      daoNamesContract.name,
      FungibleConditionCode.LessEqual,
      1
    ),
    makeContractNonFungiblePostCondition(
      daoNamesContract.address,
      daoNamesContract.name,
      NonFungibleConditionCode.DoesNotOwn,
      createAssetInfo('ST000000000000000000002AMW42H', 'bns', 'names'),
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
          postConditionMode: PostConditionMode.Deny,
        });
      }}
    >
      {label}
    </button>
  );
};
