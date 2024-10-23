// __| |_____________________________________________________| |__
// __   _____________________________________________________   __
//   | |                                                     | |
//   | |           ____       _     _                        | |
//   | |          | __ ) _ __(_) __| | __ _  ___             | |
//   | |          |  _ \| '__| |/ _` |/ _` |/ _ \            | |
//   | |          | |_) | |  | | (_| | (_| |  __/            | |
//   | |          |____/|_|  |_|\__,_|\__, |\___|            | |
//   | |                             |___/                   | |
// __| |_____________________________________________________| |__
// __   _____________________________________________________   __
//   | |                                                     | |

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IERC20Burnable } from "./interfaces/IERC20Burnable.sol";
import "./errors/Errors.sol";


/**
 * @title SaniksinBridge
 * @author Oleksandr Makedon
 * @notice This contract is deployed on the following networks::
 * - Polygon Amoy Testnet
 * - BSC Testnet
 */
contract SaniksinBridge is Ownable, Pausable, ReentrancyGuard {
    /**
     * @dev Используем SafeERC20 для перевода токенов в IERC20;
     */
    using SafeERC20 for IERC20Burnable;

    /**
     * @dev Адрес аккаунта и статус signer.
     */
    mapping(address accountAddress => bool isSigner) public signers;

    /**
     * @dev Структура для хранения информации о токене, разрешённом для использования в мосте.
     * @param allowed Указывает, разрешён ли токен для использования в мосте.
     * @param minAmount Минимальное количество токенов, которое может быть передано через мост.
     */
    struct TokenInfo {
        bool allowed; // Разрешён ли токен для использования в мосте
        uint256 minAmount; // Минимальное количество токенов для бриджа
    }

    /**
     * @dev Контракт токена и его разрешение для моста.
     */
    mapping(address tokenContract => TokenInfo) public isTokenAllowed;

    /**
     * @dev Идентификатор сети и её разрешение для моста.
     */
    mapping(uint256 chainId => bool allowedChain) public isChainAllowed;

    /**
     * @dev Событие, испускаемое при добавлении или удалении разрешённого токена.
     * Параметры:
     * @param token: Адрес контракта токена, который был добавлен или удалён.
     * @param status: Логическое значение, указывающее статус разрешения (добавлен или удалён).
     */
    event TokenAllowed(address indexed token, bool indexed status, uint256 indexed bridgeMinAmount);

    /**
     * @dev Событие, испускаемое при добавлении или удалении разрешённой сети для использования в мосте.
     * Параметры:
     * @param chainId: Идентификатор сети, который был добавлен или удалён.
     * @param status: Логическое значение, указывающее статус разрешения (добавлена или удалена).
     */
    event ChainAllowed(uint256 indexed chainId, bool indexed status);

    /**
     * @dev Событие, испускаемое при добавлении или удалении подписанта (signer).
     * Параметры:
     * @param signer: Адрес подписанта, статус которого был изменён.
     * @param status: Логическое значение, указывающее, является ли этот адрес подписантом (добавлен или удалён).
     */
    event SignerStatusUpdated(address indexed signer, bool indexed status);


    /**
     * @dev Событие, испускаемое при депозите токенов пользователем для передачи через мост.
     * Параметры:
     * @param from: Адрес пользователя, инициирующего передачу.
     * @param recipient: Адрес получателя в целевой сети.
     * @param token: Адрес контракта токена.
     * @param chainId: Идентификатор целевой сети.
     * @param amount: Количество токенов для передачи.
     */
    event DepositFromUser(
        address from, 
        address indexed recipient, 
        address indexed token, 
        uint256 chainId, 
        uint256 indexed amount
    );

    /**
     * @dev Событие, испускаемое подписантом (signer) при выпуске токенов на адрес пользователя в целевой сети.
     * Параметры:
     * @param singer: Адрес пользователя, инициирующего передачу.
     * @param recipient: Адрес получателя в целевой сети.
     * @param token: Адрес контракта токена..
     * @param amount: Количество токенов для передачи.
     */
    event SignerMintToUser(
        address singer, 
        address indexed recipient, 
        address indexed token, 
        uint256 indexed amount
    );

    /**
     * @dev Конструктор контракта, устанавливающий владельцем адрес, который развертывает контракт.
     */
    constructor() Ownable(msg.sender) {
    }

    // Модификатор проверяет, что данную функцию может вызывать только signer.
    modifier onlySigner() {
        require(
            signers[msg.sender],
            Bridge__OnlyAuthorizedSigners()
        );
        _;
    }

    /**
     * @dev Приостанавливает выполнение функций контракта. Может быть вызвана только владельцем.
     * Используется модификатор `onlyOwner` для ограничения доступа.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Возобновляет выполнение функций контракта, если он был приостановлен. Может быть вызвана только владельцем.
     * Используется модификатор `onlyOwner` для ограничения доступа.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /** 
     * @dev Добавляет или удаляет разрешённый токен для использования в мосте.
     * Может быть вызвана только владельцем.
     * Параметры:
     * @param token: Адрес контракта токена, который необходимо разрешить или запретить.
     * @param allowed: Логическое значение, указывающее, разрешён ли данный токен.
     */
    function setAllowedToken(address token, bool allowed, uint256 bridgeMinAmount) external onlyOwner {
        isTokenAllowed[token].allowed = allowed;
        isTokenAllowed[token].minAmount = bridgeMinAmount;
        emit TokenAllowed(token, allowed, bridgeMinAmount);
    }

    /** 
     * @dev Добавляет или удаляет разрешённую сеть для использования в мосте.
     * Может быть вызвана только владельцем.
     * Параметры:
     * @param chainId: Идентификатор сети, который необходимо разрешить или запретить.
     * @param allowed: Логическое значение, указывающее, разрешена ли данная сеть.
     */
    function setAllowedChain(uint256 chainId, bool allowed) external onlyOwner {
        isChainAllowed[chainId] = allowed;
        emit ChainAllowed(chainId, allowed);
    }

    /** 
     * @dev Устанавливает статус подписи (signer) для конкретного адреса.
     * Может быть вызвана только владельцем.
     * Параметры:
     * @param account: Адрес аккаунта, который нужно назначить или убрать как подпись.
     * @param enabled: Логическое значение, указывающее, является ли этот аккаунт подписантом.
     */
    function setSigner(address account, bool enabled) external onlyOwner {
        signers[account] = enabled;
        emit SignerStatusUpdated(account, enabled);
    }

    /**
     * @dev Выполняет мостовую передачу токенов, сжигая их на исходной цепи и создавая событие для дальнейшей обработки.
     *
     * Следуем паттерну CEI (Checks-Effects-Interactions), чтобы минимизировать риски атак, связанных с повторным использованием.
     * 
     * Требует, чтобы токен был разрешен к мостовой передаче, и идентификатор целевой сети был допустимым.
     * 
     * После проверки условий вызывается событие `DepositFromUser`, чтобы сигнализировать о намерении переместить токены через мост.
     * Затем токены переводятся на адрес этого контракта и сжигаются для завершения процедуры.
     *
     * Параметры:
     * @param from: Адрес пользователя, инициирующего передачу.
     * @param recipient: Адрес получателя в целевой сети.
     * @param token: Адрес контракта токена.
     * @param chainId: Идентификатор целевой сети.
     * @param amount: Количество токенов для передачи.
     *
     * Требует успешного сжигания токенов, иначе операция будет отклонена.
     * 
     * Используется модификатор `whenNotPaused`, чтобы убедиться, что функция не вызывается, если контракт приостановлен.
     */
    function bridgeTokens(
        address from, 
        address recipient, 
        address token, 
        uint256 chainId, 
        uint256 amount
    ) external whenNotPaused nonReentrant {

        require(isTokenAllowed[token].allowed, Bridge__TokenNotAllowed());
        require(amount >= isTokenAllowed[token].minAmount, Bridge__AmountBelowMinimum());
        require(isChainAllowed[chainId], Bridge__ChainIdNotAllowed());    

        emit DepositFromUser(from, recipient, token, chainId, amount);

        IERC20Burnable(token).safeTransferFrom(from, address(this), amount);

        bool success = IERC20Burnable(token).burn(address(this), amount);
        require(success, Bridge__TokenBurnProblem());
    }

    /**
     * @dev Выполняет минт токенов на адрес пользователя в целевой сети после завершения мостовой операции.
     *
     * Функция может быть вызвана только подписантом (signer) и только если контракт не приостановлен.
     * 
     * Сначала испускает событие `SignerMintToUser`, чтобы сигнализировать о выпуске токенов.
     * Затем вызывает функцию `mint` у контракта токена для создания новых токенов на адресе получателя.
     *
     * Параметры:
     * @param recipient: Адрес получателя токенов.
     * @param token: Адрес контракта токена.
     * @param amount: Количество токенов для выпуска.
     *
     * Требует успешного выпуска токенов, иначе операция будет отклонена.
     */
    function mintTokenToUserAfterBridge(address recipient, address token, uint256 amount) external whenNotPaused onlySigner {
        
        emit SignerMintToUser(msg.sender, recipient, token, amount);

        bool success = IERC20Burnable(token).mint(recipient, amount);

        require(success, Bridge__TokenMintProblem());
    }
}