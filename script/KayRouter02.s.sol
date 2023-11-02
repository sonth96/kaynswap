// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.12;

import {Script, console2} from "forge-std/Script.sol";
import {KayRouter02} from "../src/KayRouter02.sol";

contract KayRouter02Script is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        KayRouter02 router = new KayRouter02();

        vm.stopBroadcast();
    }
}
