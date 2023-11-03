// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import {Test, console2} from "forge-std/Test.sol";
import {KayRouter02} from "../src/KayRouter02.sol";
import {IKIP7} from "../src/interfaces/IKIP7.sol";
import {SafeMath} from "../src/SafeMath.sol";

contract SwapTest is Test {
    using SafeMath for uint256;

    uint256 kayMainnetCypressFork;
    string MAINNET_RPC_URL = vm.envString("MAINNET_RPC_URL");
    KayRouter02 public router;
    IKIP7 oUsdt;
    IKIP7 oXrp;

    function setUp() public {
        kayMainnetCypressFork = vm.createFork(MAINNET_RPC_URL);
        vm.selectFork(kayMainnetCypressFork);
        router = new KayRouter02();
        oUsdt = IKIP7(0x754288077D0fF82AF7a5317C7CB8c444D421d103);
        oXrp = IKIP7(0x9eaeFb09fe4aABFbE6b1ca316a3c36aFC83A393F);
    }

    function test_swap() public {
        uint256 amount = 1 * 10 ** uint256(oUsdt.decimals());

        // Sets the *next* call's msg.sender to be the input address
        // aka use this real address on mainnet as the one who calls these following functions
        vm.prank(address(0x595A94Eb3CceB88c067a4F6CceE4212Ea277313b));
        oUsdt.approve(address(router), amount);

        uint256 slippage = 5; // 0.5 %;

        uint estimatedOut = router.estimatePos(
            address(oUsdt),
            address(oXrp),
            amount
        );

        uint256 amountOutMin = estimatedOut.mul(1000 - slippage).div(1000);

        vm.prank(address(0x595A94Eb3CceB88c067a4F6CceE4212Ea277313b));
        router.swapExactToken(
            address(oUsdt),
            address(oXrp),
            amount,
            amountOutMin,
            block.timestamp + 100
        );
    }
}
