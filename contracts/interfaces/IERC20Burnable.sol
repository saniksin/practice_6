// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";


interface IERC20Burnable is IERC20 {
    /**
     * @dev Создает (минтит) указанное количество токенов и отправляет их на адрес `to`.
     * Возвращает `true` при успешном выполнении.
     */
    function mint(address to, uint256 amount) external returns (bool);
    
    /**
     * @dev Сжигает (удаляет) указанное количество токенов с адреса `from`.
     * Возвращает `true` при успешном выполнении.
     */
    function burn(address from, uint256 amount) external returns (bool);
}