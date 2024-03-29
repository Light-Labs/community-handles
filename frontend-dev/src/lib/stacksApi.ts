import { Configuration, NamesApi, SmartContractsApi } from '@stacks/blockchain-api-client';
import { StacksMainnet, StacksTestnet } from 'micro-stacks/network';
import { mainnet } from './constants';

export const network = mainnet ? new StacksMainnet() : new StacksTestnet();

const config = new Configuration({
  basePath: network.coreApiUrl,
  fetchApi: fetch,
});
export const namesApi = new NamesApi(config);
export const smartcontractsApi = new SmartContractsApi(config);
export const genesisAddress = mainnet
  ? 'SP000000000000000000002Q6VF78'
  : 'ST000000000000000000002AMW42H';
