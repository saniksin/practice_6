import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Bridge = buildModule("saniksinBridge", (m) => {
  const saniksinBridge = m.contract("SaniksinBridge");
  return { saniksinBridge };
});

export default Bridge;