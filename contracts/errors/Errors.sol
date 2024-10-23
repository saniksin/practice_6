// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @dev Только владелец/бридж/провайдер может вызвать эту функию.
 */
error Token__OnlyAuthorizedCallers();

/**
 * @dev Депозит токена не разрешен
 */
error Bridge__TokenNotAllowed();

/**
 * @dev Депозит токена не разрешен
 */
error Bridge__ChainIdNotAllowed();

/**
 * @dev Депозит токена не разрешен
 */
error Bridge__TokenBurnProblem();

/**
 * @dev Депозит токена не разрешен
 */
error Bridge__OnlyAuthorizedSigners();

/**
 * @dev Депозит токена не разрешен
 */
error Bridge__TokenMintProblem();

/**
 * @dev Депозит токена не разрешен
 */
error Bridge__AmountBelowMinimum();
