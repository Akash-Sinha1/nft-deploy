/* eslint-disable */
const fs = require("fs");
const path = require("path");
const solc = require("solc");

function compile() {
  const contractPath = path.resolve(__dirname, "BaseNFTCollection.sol");
  const sourceCode = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      "BaseNFTCollection.sol": {
        content: sourceCode,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  console.log("Compiling custom Solidity contract using solc-js...");
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    let hasErrors = false;
    output.errors.forEach((err) => {
      console.log(err.formattedMessage);
      if (err.severity === "error") {
        hasErrors = true;
      }
    });
    if (hasErrors) {
      throw new Error("Solidity compilation failed.");
    }
  }

  const contractOutput = output.contracts["BaseNFTCollection.sol"]["BaseNFTCollection"];
  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;

  const targetPath = path.resolve(__dirname, "../lib/contract.ts");

  const content = `// ==============================================================================
// CUSTOM ERC-721 SMART CONTRACT METADATA (ABI & BYTECODE)
// Generated programmatically via solc-js compilation.
// ==============================================================================

export const NFT_CONTRACT_ABI = ${JSON.stringify(abi, null, 2)} as const;

export const NFT_CONTRACT_BYTECODE = "0x${bytecode}";
`;

  fs.writeFileSync(targetPath, content, "utf8");
  console.log(`Success! Compiled ABI and Bytecode written to: ${targetPath}`);
}

compile();
