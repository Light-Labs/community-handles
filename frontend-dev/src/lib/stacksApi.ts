import { Configuration, NamesApi, SmartContractsApi } from '@stacks/blockchain-api-client';
import { StacksNetworkVersion } from 'micro-stacks/crypto';
import { StacksMainnet } from 'micro-stacks/network';

export const network = new StacksMainnet();

const config = new Configuration({
  basePath: network.coreApiUrl,
  fetchApi: fetch,
});
export const namesApi = new NamesApi(config);
export const smartcontractsApi = new SmartContractsApi(config);
