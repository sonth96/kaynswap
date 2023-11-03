// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IKLAYSwap.sol";
import "./interfaces/IKIP7.sol";
import "./interfaces/IKSLPool.sol";
import "./SafeMath.sol";

contract KayRouter02 {
    address uniRouterAddress =
        address(0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654);

    using SafeMath for uint256;

    constructor() public {}

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, "KayRouter02: EXPIRED");
        _;
    }

    ///@dev swap Kayn to any token
    function swapExactKay(
        address token,
        uint256 amount,
        uint256 deadline
    ) public ensure(deadline) {
        require(amount != 0);
        IKLAYSwap(uniRouterAddress).exchangeKlayPos{value: amount}(
            token,
            1,
            new address[](0)
        );
    }

    /// @dev swap any token to token
    function swapExactToken(
        address tokenA,
        address tokenB,
        uint256 amountIn,
        uint256 amountOutMin, // slippage included
        uint256 deadline
    ) public ensure(deadline) {
        require(amountIn != 0);
        // Call approve on ui first
        tranferFrom(tokenA, msg.sender, address(this), amountIn);
        increaseApproval(tokenA, uniRouterAddress, amountIn);
        address pool = IKLAYSwap(uniRouterAddress).tokenToPool(tokenA, tokenB);

        require(pool != address(0), "KayRouter02: POOL_NOT_FOUND");
        uint256 estimatedB = IKSLPool(pool).estimatePos(tokenA, amountIn);
        require(
            estimatedB >= amountOutMin,
            "KayRouter02: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        IKLAYSwap(uniRouterAddress).exchangeKctPos(
            tokenA,
            amountIn,
            tokenB,
            estimatedB,
            new address[](0)
        );
    }

    function estimatePos(
        address tokenA,
        address tokenB,
        uint256 amountIn
    ) public view returns (uint) {
        address pool = IKLAYSwap(uniRouterAddress).tokenToPool(tokenA, tokenB);

        require(pool != address(0), "KayRouter02: POOL_NOT_FOUND");
        return IKSLPool(pool).estimatePos(tokenA, amountIn);
    }

    function increaseApproval(address token, address to, uint amount) private {
        uint allowance = IKIP7(token).allowance(address(this), to);
        IKIP7(token).approve(to, allowance.add(amount));
    }

    function tranferFrom(
        address token,
        address from,
        address to,
        uint amount
    ) private {
        IKIP7(token).transferFrom(from, to, amount);
    }
}
