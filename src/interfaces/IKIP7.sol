// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

interface IKIP7 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function decimals() external view returns (uint8);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function increaseApproval(
        address spender,
        uint256 value
    ) external returns (bool);

    function decreaseApproval(
        address spender,
        uint256 value
    ) external returns (bool);
}
