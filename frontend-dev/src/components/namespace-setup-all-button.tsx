import { BufferCV, bufferCVFromString, ClarityValue, uintCV, UIntCV } from 'micro-stacks/clarity';
import { useAuth, useOpenContractCall, useOpenContractDeploy } from '@micro-stacks/react';
import { PostConditionMode } from 'micro-stacks/transactions';

export const NamespaceSetupAllButton = () => {
  const { openContractDeploy } = useOpenContractDeploy();
  const label = `Setup many namespaces`;

  const contractName = 'detailed-plum-wren';
  const codeBody = `(contract-call? .community-handles-v1 namespace-setup 0x6e6f6e6e697368 u640000000 u52560)
`;

  return (
    <button
      onClick={() => {
        void openContractDeploy({
          codeBody,
          contractName,
          postConditionMode: PostConditionMode.Allow,
        });
      }}
    >
      {label}
    </button>
  );
};
