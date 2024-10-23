// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./errors/Errors.sol";


// контракт моего стейбл коина
contract MyERC20Token is ERC20 {
    // владелец 
    address immutable public owner;
    address immutable bridge;

    // Модификатор проверяет, что данную функцию может вызывать только владелец контракта или менеджер.
    modifier onlyAuthorized() {
        require(
            msg.sender == owner ||
            msg.sender == bridge,
            Token__OnlyAuthorizedCallers()
        );
        _;
    }

    /**
     * @dev Конструктор вызывается при создании контракта
     * @param _owner - адрес владальца токена
     */
    constructor(
        address _owner, 
        address _bridge,
        string memory _name, 
        string memory _symbol
    ) ERC20(_name, _symbol) {
        owner = _owner;
        bridge = _bridge;
    }

    /**
     * @dev Вызывается для минта токенов, может быть вызвана только владельцем или мостом
     * @param to - адрес того кому минтим.
     * @param amount - значение сколько токенов минтим в wei.
     * Возвращает `true` при успешном выполнении.
     */
    function mint(address to, uint256 amount) external onlyAuthorized returns (bool status) {
        _mint(to, amount);
        status = true;
    }

    /**
     * @dev Вызывается для минта токенов, может быть вызвана только владельцем или мостом
     * @param from - адрес у кого сжигаем.
     * @param amount - значение сколько сжигаем сжигаем в wei.
     * Возвращает `true` при успешном выполнении.
     */
    function burn(address from, uint256 amount) external onlyAuthorized returns(bool status) {
        _burn(from, amount);
        status = true;
    }
}