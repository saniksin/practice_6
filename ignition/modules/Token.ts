import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyERC20Token = buildModule("MyERC20Token", (m) => {
  const saniksinUSD = m.contract("MyERC20Token");
  return { saniksinUSD };
});

export default MyERC20Token;