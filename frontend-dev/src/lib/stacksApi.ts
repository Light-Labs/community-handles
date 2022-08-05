import { Configuration, NamesApi } from '@stacks/blockchain-api-client';
import { StacksNetworkVersion } from 'micro-stacks/crypto';
import { StacksTestnet } from 'micro-stacks/network';

export const network = new StacksTestnet();

const config = new Configuration({
  basePath: network.coreApiUrl,
  fetchApi: fetch,
});
export const namesApi = new NamesApi(config);

