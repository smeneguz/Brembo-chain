// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EspeTracker is ERC721, ERC721Holder, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => Espe) private _espes;

    event EspeCreated(uint256 tokenId);

    event EspeUpdated(uint256 tokenId, bytes32 hash);

    modifier checkExistence(uint espeId) {
        require(
            _espes[espeId].exists == true,
            "EspeTracker: espeId doesn't exist"
        );
        _;
    }

    struct Espe {
        bytes32 hash;
        bool updated;
        bool exists;
    }

    constructor() ERC721("EspeTracker", "EST") {}

    function createEspe() public onlyOwner {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(owner(), newTokenId);

        Espe storage newEspe = _espes[newTokenId];
        newEspe.exists = true;
        newEspe.updated = false;

        emit EspeCreated(newTokenId);
    }

    function updateEspe(
        uint espeId,
        bytes32 hash
    ) public checkExistence(espeId) {
        require(
            _espes[espeId].updated == false,
            "ESPETracker: Espe already updated!"
        );
        _espes[espeId].updated = true;
        _espes[espeId].hash = hash;
        emit EspeUpdated(espeId, hash);
    }

    function getEspe(
        uint espeId
    ) public view checkExistence(espeId) returns (Espe memory) {
        return _espes[espeId];
    }

    function verify(
        uint espeId,
        bytes32 xmlHash
    ) public view checkExistence(espeId) returns (bool) {
        return _espes[espeId].hash == xmlHash;
    }
}
