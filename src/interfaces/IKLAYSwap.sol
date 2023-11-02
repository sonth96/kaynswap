// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

interface IKLAYSwap {
    function tokenA() external view returns (address);

    function tokenB() external view returns (address);

    function fee() external view returns (uint);

    function tokenToPool(address, address) external view returns (address);

    function getCurrentPool() external view returns (uint, uint);

    function claimReward() external;

    function addKlayLiquidity(uint) external payable;

    function addKctLiquidity(uint, uint) external;

    function removeLiquidity(uint) external;

    function exchangeKctPos(
        address tokenAA,
        uint256 amountAA,
        address tokenBB,
        uint256 amountBB,
        address[] memory path
    ) external;

    function exchangeKctNeg(
        address tokenAA,
        uint256 amountAA,
        address tokenBB,
        uint256 amountBB,
        address[] memory path
    ) external;

    function exchangeKlayPos(
        address token,
        uint256 amount,
        address[] memory path
    ) external payable;
}
