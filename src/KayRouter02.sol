// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IKLAYSwap.sol";
import "./interfaces/IKIP7.sol";
import "./SafeMath.sol";

contract KayRouter02 {
    address uniRouterAddress =
        address(0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654);

    using SafeMath for uint256;

    constructor() public {}

    ///@dev swap Kayn to any token
    function swapExactKay(address token, uint256 amount) public {
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
        uint256 amount
    ) public {
        require(amount != 0);
        // Call approve on ui first
        tranferFrom(tokenA, msg.sender, address(this), amount);
        increaseApproval(tokenA, uniRouterAddress, amount);
        address pool = IKLAYSwap(uniRouterAddress).tokenToPool(tokenA, tokenB);

        if (pool == address(0)) {
            address[] memory path = new address[](1);
            path[0] = tokenB;
            IKLAYSwap(uniRouterAddress).exchangeKctNeg(
                tokenA,
                amount,
                address(0),
                1,
                path
            );
        } else {
            IKLAYSwap(uniRouterAddress).exchangeKctPos(
                tokenA,
                amount,
                tokenB,
                1,
                new address[](0)
            );
        }
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
